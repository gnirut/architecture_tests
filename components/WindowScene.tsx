import React, { useMemo } from 'react';
import { OrbitControls, OrthographicCamera, Environment, ContactShadows } from '@react-three/drei';
import { AnimatedPart } from './AnimatedPart';
import { PartConfig } from '../types';

interface WindowSceneProps {
  progressRef: React.MutableRefObject<number>;
}

// Architectural Colors matched to provided images
const COLORS = {
  WALL_SIDING: '#606060', 
  WALL_STRIP: '#202020', 
  STEEL_STRUCT: '#71717a', // Neutral Grey steel
  YELLOW_INSULATION: '#fde047', // Vibrant architectural yellow
  TIMBER_FRAME: '#9a3412', // Reddish/Brown wood
  EXTERIOR_CLADDING: '#18181b', // Near black
  GLASS: '#a5f3fc',
};

// Static Background Component (The Wall)
const StaticWall = () => {
  const siding = useMemo(() => {
    const items = [];
    const width = 16;
    const height = 16;
    const plankWidth = 0.4; // Wider vertical panels
    const gap = 0.02;
    const count = Math.ceil(width / (plankWidth + gap));

    for (let i = 0; i < count; i++) {
      const x = -width / 2 + i * (plankWidth + gap);
      // Alternate slight color variations for realism
      const color = i % 2 === 0 ? COLORS.WALL_SIDING : '#555555';
      
      items.push(
        <mesh key={i} position={[x, 0, -0.2]} receiveShadow>
          <boxGeometry args={[plankWidth, height, 0.2]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      );
      items.push(
         <mesh key={`gap-${i}`} position={[x + plankWidth/2 + gap/2, 0, -0.25]}>
          <boxGeometry args={[gap, height, 0.1]} />
          <meshStandardMaterial color={COLORS.WALL_STRIP} />
        </mesh>
      )
    }
    return items;
  }, []);

  return (
    <group position={[0, 0, -0.1]}>
      {siding}
      {/* Wall opening mask */}
      <mesh position={[0, 0, -0.19]}>
        <boxGeometry args={[3.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#101010" />
      </mesh>
    </group>
  );
};

export const WindowScene: React.FC<WindowSceneProps> = ({ progressRef }) => {
  
  const parts: PartConfig[] = useMemo(() => {
    const list: PartConfig[] = [];
    
    // --- DIMENSIONS & CONFIGURATION ---
    // The window is a large rectangular box protruding from wall.
    const BoxW = 2.8;  // Total Width
    const BoxH = 1.9;  // Total Height
    const Depth = 0.8; // Protrusion Depth
    const BeamSize = 0.14; // Thickness of steel structural members
    
    const ExplodeZ = 5.0; // Forward explosion distance
    const ExplodeXY = 2.5; // Sideways explosion distance

    // --- 1. WALL RAILS (The vertical tracks on the wall) ---
    const railH = BoxH + 0.6;
    const railX = BoxW/2 - BeamSize/2;
    
    // Left Rail
    list.push({
      id: 'rail-left',
      name: 'Wall Rail Left',
      type: 'box',
      color: COLORS.STEEL_STRUCT,
      args: [BeamSize, railH, 0.1],
      assembledPos: [-railX, 0, 0],
      explodedPos: [-railX, 0, 0], // Stays on wall
      delay: 0, duration: 0.1
    });
    // Right Rail
    list.push({
      id: 'rail-right',
      name: 'Wall Rail Right',
      type: 'box',
      color: COLORS.STEEL_STRUCT,
      args: [BeamSize, railH, 0.1],
      assembledPos: [railX, 0, 0],
      explodedPos: [railX, 0, 0],
      delay: 0, duration: 0.1
    });

    // --- 2. STEEL SKELETON (Horizontal Cantilevers) ---
    // These define the 4 corners of the box.
    // They are FLUSH with the panels that go between them.
    const beamLen = Depth;
    const beamZ = Depth / 2;
    const beamY_Top = BoxH/2 - BeamSize/2;
    const beamY_Bot = -(BoxH/2 - BeamSize/2);
    const beamX_Left = -(BoxW/2 - BeamSize/2);
    const beamX_Right = (BoxW/2 - BeamSize/2);

    const beams = [
      { id: 'beam-tl', x: beamX_Left, y: beamY_Top },
      { id: 'beam-tr', x: beamX_Right, y: beamY_Top },
      { id: 'beam-bl', x: beamX_Left, y: beamY_Bot },
      { id: 'beam-br', x: beamX_Right, y: beamY_Bot },
    ];

    beams.forEach((b, i) => {
      list.push({
        id: b.id,
        name: 'Steel Beam',
        type: 'box',
        color: COLORS.STEEL_STRUCT,
        args: [BeamSize, BeamSize, beamLen],
        assembledPos: [b.x, b.y, beamZ],
        explodedPos: [b.x, b.y, ExplodeZ * 0.2], // Move out slightly
        delay: 0.1,
        duration: 0.4,
      });
    });

    // --- 3. YELLOW INSULATION PANELS (The "Reveal") ---
    // These fit BETWEEN the steel beams.
    // "Aligned, not on top" -> They share the same Z-space and Y-space boundaires where they meet.
    
    // Top Panel: Fits between the two top beams.
    // Width = BoxW - 2*BeamSize
    const innerW = BoxW - (BeamSize * 2); 
    const innerH = BoxH - (BeamSize * 2);
    
    // Top Insulation (Ceiling of the box)
    list.push({
      id: 'yellow-top',
      name: 'Insulation Top',
      type: 'box',
      color: COLORS.YELLOW_INSULATION,
      args: [innerW, BeamSize, Depth], // Same thickness as beam for flush look
      assembledPos: [0, beamY_Top, beamZ],
      explodedPos: [0, beamY_Top + ExplodeXY/2, ExplodeZ * 0.5],
      delay: 0.3, duration: 0.5
    });

    // Bottom Insulation (Sill of the box - Thick Bench)
    list.push({
      id: 'yellow-bot',
      name: 'Insulation Sill',
      type: 'box',
      color: COLORS.YELLOW_INSULATION,
      args: [innerW, BeamSize, Depth],
      assembledPos: [0, beamY_Bot, beamZ],
      explodedPos: [0, beamY_Bot - ExplodeXY/2, ExplodeZ * 0.5],
      delay: 0.3, duration: 0.5
    });

    // Side Insulation (Walls of the box)
    // These fit vertically between the Top and Bottom assemblies? 
    // Or do they run full height? In the reference, the corners are steel.
    // So sides fit between Top Beam and Bottom Beam vertically.
    // Height = BoxH - 2*BeamSize
    
    // Left Yellow Panel
    list.push({
      id: 'yellow-left',
      name: 'Insulation Left',
      type: 'box',
      color: COLORS.YELLOW_INSULATION,
      args: [BeamSize, innerH, Depth],
      assembledPos: [beamX_Left, 0, beamZ],
      explodedPos: [beamX_Left - ExplodeXY/2, 0, ExplodeZ * 0.5],
      delay: 0.35, duration: 0.5
    });

    // Right Yellow Panel
    list.push({
      id: 'yellow-right',
      name: 'Insulation Right',
      type: 'box',
      color: COLORS.YELLOW_INSULATION,
      args: [BeamSize, innerH, Depth],
      assembledPos: [beamX_Right, 0, beamZ],
      explodedPos: [beamX_Right + ExplodeXY/2, 0, ExplodeZ * 0.5],
      delay: 0.35, duration: 0.5
    });
    
    // Note: The above creates a "frame" where corners are doubled?
    // Wait, if Beam is at corner, and Yellow Panel is at corner... overlap!
    // FIX:
    // Beams are at the 4 corners.
    // Top Yellow is between Top-Left and Top-Right beams.
    // Bot Yellow is between Bot-Left and Bot-Right beams.
    // Left Yellow is between Top-Left and Bot-Left beams.
    // Right Yellow is between Top-Right and Bot-Right beams.
    // This creates a perfect box with steel corners.
    
    // Adjusting Positions to be distinct:
    // Top Yellow is already at X=0 (Center), Width = innerW. Correct.
    // Left Yellow needs to be at X = Left Beam X? No, that would overlap the beam.
    // Actually, looking at the image: The steel is the SKELETON. The yellow is the LINING.
    // So the yellow panels are likely INSIDE the steel frame.
    // Let's make the yellow panels form a smaller box INSIDE the steel beams.
    // But the user said "Aligned... not on top".
    // Let's assume the face is flush.
    
    // REVISED STRATEGY: 
    // Steel Beams are the structural corners.
    // Yellow panels FILL the faces between these corners.
    // Side Yellow Panels: Height = innerH. Position = X is aligned with the beams? 
    // No, if they fill the side, they are parallel to beams.
    // Let's assume the construction is:
    // 1. Steel Beams stick out.
    // 2. Yellow panels are inserted vertically between the top and bottom beams to close the sides.
    // 3. Yellow panels are inserted horizontally between the side beams to close top/bottom? No.
    // The image shows a continuous yellow reveal.
    
    // Let's place the side yellow panels just INSIDE the vertical plane of the steel beams?
    // No, "Aligned".
    // I will place the Side Yellow Panels *between* the Top and Bottom beams.
    // I will place the Top/Bot Yellow Panels *between* the Left and Right beams? No that conflicts at corners.
    
    // Best visual match:
    // Top/Bot Yellow Panels span the full width BETWEEN the vertical side cladding?
    // Let's stick to: Top Yellow fits between TL and TR beams.
    // Bot Yellow fits between BL and BR beams.
    // Left Yellow fits between TL and BL beams.
    // Right Yellow fits between TR and BR beams.
    // This implies the beams are square blocks at the corners, and panels fill the gaps.
    
    // 3. YELLOW PANELS (Refined)
    // Top/Bot
    list.find(p => p.id === 'yellow-top')!.args = [innerW, 0.05, Depth]; // Thinner lining?
    list.find(p => p.id === 'yellow-top')!.assembledPos = [0, beamY_Top - BeamSize/2 + 0.025, beamZ]; // Flush with bottom of top beam
    
    list.find(p => p.id === 'yellow-bot')!.args = [innerW, 0.15, Depth]; // THICK SILL
    list.find(p => p.id === 'yellow-bot')!.assembledPos = [0, beamY_Bot + BeamSize/2 - 0.075 + 0.15, beamZ]; // Sit ON bottom beam?
    // User said "Not on top". 
    // Let's align it FLUSH with the top of the bottom beam.
    list.find(p => p.id === 'yellow-bot')!.assembledPos = [0, beamY_Bot, beamZ]; 
    list.find(p => p.id === 'yellow-bot')!.args = [innerW, BeamSize, Depth]; // Match beam size exactly.
    
    // Sides
    list.find(p => p.id === 'yellow-left')!.args = [0.05, innerH, Depth]; // Thin lining
    list.find(p => p.id === 'yellow-left')!.assembledPos = [beamX_Left + BeamSize/2 - 0.025, 0, beamZ]; // Flush with inner face
    
    list.find(p => p.id === 'yellow-right')!.args = [0.05, innerH, Depth];
    list.find(p => p.id === 'yellow-right')!.assembledPos = [beamX_Right - BeamSize/2 + 0.025, 0, beamZ]; // Flush with inner face


    // --- 4. CLADDING (Dark Outer Skin) ---
    // These cover the outsides.
    const cladThick = 0.03;
    
    // Top Cladding (Sits on top of the top beams)
    list.push({
      id: 'clad-top',
      name: 'Cladding Top',
      type: 'box',
      color: COLORS.EXTERIOR_CLADDING,
      args: [BoxW, cladThick, Depth],
      assembledPos: [0, beamY_Top + BeamSize/2 + cladThick/2, beamZ],
      explodedPos: [0, beamY_Top + ExplodeXY, ExplodeZ],
      delay: 0.6, duration: 0.4
    });
    
    // Bottom Cladding
    list.push({
      id: 'clad-bot',
      name: 'Cladding Bot',
      type: 'box',
      color: COLORS.EXTERIOR_CLADDING,
      args: [BoxW, cladThick, Depth],
      assembledPos: [0, beamY_Bot - BeamSize/2 - cladThick/2, beamZ],
      explodedPos: [0, beamY_Bot - ExplodeXY, ExplodeZ],
      delay: 0.6, duration: 0.4
    });
    
    // Left Cladding (Covers the side, including the ends of top/bot cladding?)
    // Let's make it cover the side of the beams.
    list.push({
      id: 'clad-left',
      name: 'Cladding Left',
      type: 'box',
      color: COLORS.EXTERIOR_CLADDING,
      args: [cladThick, BoxH + 0.1, Depth],
      assembledPos: [beamX_Left - BeamSize/2 - cladThick/2, 0, beamZ],
      explodedPos: [beamX_Left - ExplodeXY, 0, ExplodeZ],
      delay: 0.65, duration: 0.4
    });

    // Right Cladding
    list.push({
      id: 'clad-right',
      name: 'Cladding Right',
      type: 'box',
      color: COLORS.EXTERIOR_CLADDING,
      args: [cladThick, BoxH + 0.1, Depth],
      assembledPos: [beamX_Right + BeamSize/2 + cladThick/2, 0, beamZ],
      explodedPos: [beamX_Right + ExplodeXY, 0, ExplodeZ],
      delay: 0.65, duration: 0.4
    });


    // --- 5. TIMBER WINDOW FRAME ---
    // Recessed inside the yellow tunnel.
    const winFrameThick = 0.12;
    const winFrameDepth = 0.15;
    const winZ = 0.3; // Recessed relative to front
    const winW = innerW - 0.1; // Slight gap
    const winH = innerH - 0.1;

    // Top
    list.push({
      id: 'win-top',
      name: 'Window Top',
      type: 'box',
      color: COLORS.TIMBER_FRAME,
      args: [winW, winFrameThick, winFrameDepth],
      assembledPos: [0, winH/2 - winFrameThick/2, winZ],
      explodedPos: [0, winH/2, ExplodeZ * 0.8],
      delay: 0.45, duration: 0.5
    });
    // Bottom
    list.push({
      id: 'win-bot',
      name: 'Window Bot',
      type: 'box',
      color: COLORS.TIMBER_FRAME,
      args: [winW, winFrameThick, winFrameDepth],
      assembledPos: [0, -(winH/2 - winFrameThick/2), winZ],
      explodedPos: [0, -winH/2, ExplodeZ * 0.8],
      delay: 0.45, duration: 0.5
    });
    // Sides
    list.push({
      id: 'win-left',
      name: 'Window Left',
      type: 'box',
      color: COLORS.TIMBER_FRAME,
      args: [winFrameThick, winH - 2*winFrameThick, winFrameDepth],
      assembledPos: [-(winW/2 - winFrameThick/2), 0, winZ],
      explodedPos: [-winW/2, 0, ExplodeZ * 0.8],
      delay: 0.5, duration: 0.5
    });
    list.push({
      id: 'win-right',
      name: 'Window Right',
      type: 'box',
      color: COLORS.TIMBER_FRAME,
      args: [winFrameThick, winH - 2*winFrameThick, winFrameDepth],
      assembledPos: [(winW/2 - winFrameThick/2), 0, winZ],
      explodedPos: [winW/2, 0, ExplodeZ * 0.8],
      delay: 0.5, duration: 0.5
    });

    // Glass
    list.push({
      id: 'glass',
      name: 'Glass',
      type: 'box',
      color: COLORS.GLASS,
      args: [winW - 2*winFrameThick + 0.05, winH - 2*winFrameThick + 0.05, 0.02],
      assembledPos: [0, 0, winZ],
      explodedPos: [0, 0, ExplodeZ * 0.9],
      delay: 0.55, duration: 0.5,
      opacity: 0.3, metalness: 0.9, roughness: 0.05
    });

    return list;
  }, []);

  return (
    <>
      <OrthographicCamera makeDefault position={[20, 10, 20]} zoom={60} near={0.1} far={1000} />
      
      <ambientLight intensity={1.0} />
      <directionalLight 
        position={[8, 12, 10]} 
        intensity={1.0} 
        castShadow 
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, 5, 10]} intensity={0.3} color="#fff" />
      
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        minZoom={40} 
        maxZoom={150}
        minAzimuthAngle={-Math.PI / 1.5}
        maxAzimuthAngle={Math.PI / 1.5}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.8}
      />
      
      <group position={[0, 0, 0]}>
         <StaticWall />
         {parts.map(part => (
           <AnimatedPart key={part.id} config={part} progressRef={progressRef} />
         ))}
      </group>

      <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} far={10} color="#000000" />
      <Environment preset="city" />
    </>
  );
};
