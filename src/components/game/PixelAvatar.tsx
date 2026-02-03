/**
 * PixelAvatar - Sistema de Avatar em Camadas (Estilo Habitica)
 * 
 * Renderiza personagem em múltiplas camadas sobrepostas:
 * Base > Cabelo/Corpo > Perna > Peito > Cabeça > Arma
 * 
 * Proporções: 90x90px para sprites (compatível com Habitica)
 */

import { cn } from '@/lib/utils';
import { SHOP_ITEMS } from '@/data/shopItems';
import { EQUIPMENT_LAYERS, EquipmentSlot } from '@/types/equipment';
import { useState, useCallback } from 'react';
import './PixelAvatarStyles.css';

export interface EquippedItemData {
  id: string;
  name: string;
  icon?: string;
  item_type?: string;
  rarity?: string;
}

interface PixelAvatarProps {
  playerClass: string;
  equippedHat?: string | null;
  equippedArmor?: string | null;
  equippedWeapon?: string | null;
  equippedShield?: string | null;
  equippedSkin?: string | null;
  equippedMount?: string | null;
  equippedLegs?: string | null;
  equippedAccessory?: string | null;
  equippedBackground?: string | null;
  equippedItemsData?: EquippedItemData[];
  playerUsername?: string; // Para logs
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  animated?: boolean;
  showEffects?: boolean;
}

const SIZE_MAP = {
  sm: 48,
  md: 80,
  lg: 128,
  xl: 180,
};

// Converte IDs para UUID de forma segura
const toSafeUUID = (id: string) => {
  if (!id) return '';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
};

// Busca ícone de item
const getItemIcon = (id: string | null | undefined, list?: EquippedItemData[]) => {
  if (!id) return null;
  const nid = id.toLowerCase();
  const uuid = toSafeUUID(nid).toLowerCase();

  // Busca ultra-resiliente
  const local = SHOP_ITEMS.find(i =>
    i.id.toLowerCase() === nid ||
    toSafeUUID(i.id).toLowerCase() === nid ||
    toSafeUUID(i.id).toLowerCase() === uuid
  );
  if (local) return local.icon;

  if (list) {
    const db = list.find(i =>
      i.id.toLowerCase() === nid ||
      toSafeUUID(i.id).toLowerCase() === uuid
    );
    if (db?.icon) return db.icon;
  }

  return null;
};

// Cores de raridade para glow
const RARITY_GLOW: Record<string, string> = {
  common: 'none',
  uncommon: '0 0 8px rgba(34, 197, 94, 0.6)',
  rare: '0 0 12px rgba(59, 130, 246, 0.8)',
  epic: '0 0 16px rgba(168, 85, 247, 0.9)',
  legendary: '0 0 20px rgba(234, 179, 8, 1)',
};

// Componente de Camada Individual
interface LayerProps {
  slot: EquipmentSlot;
  icon?: string | null;
  spriteUrl?: string;
  pixelSize: number;
  animated?: boolean;
}

function EquipmentLayer({ slot, icon, spriteUrl, pixelSize, animated }: LayerProps) {
  const [useFallback, setUseFallback] = useState(false);
  const layer = EQUIPMENT_LAYERS[slot];

  const handleSpriteError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (!icon && !spriteUrl) return null;

  const layerStyle = {
    zIndex: layer.zIndex,
    transform: `translate(${layer.offsetX}%, ${layer.offsetY}%) scale(${layer.scale})`,
    fontSize: `${pixelSize * 0.5}px`,
  };

  // Se temos sprite e não falhou, usa imagem
  if (spriteUrl && !useFallback) {
    return (
      <div
        className={cn(
          "pixel-layer",
          `layer-${slot}`,
          animated && "layer-animated"
        )}
        style={layerStyle}
      >
        <img
          src={spriteUrl}
          alt={slot}
          className={cn(
            "sprite-image pixelated",
            slot === 'background' && "background-image-fill"
          )}
          onError={handleSpriteError}
          style={slot !== 'background' ? {
            width: pixelSize * layer.scale,
            height: pixelSize * layer.scale,
          } : {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    );
  }

  // Fallback para emoji
  if (icon) {
    return (
      <div
        className={cn(
          "pixel-layer",
          `layer-${slot}`,
          animated && "layer-animated"
        )}
        style={layerStyle}
      >
        <span className="layer-icon">{icon}</span>
      </div>
    );
  }

  return null;
}

export function PixelAvatar({
  playerClass,
  equippedHat,
  equippedArmor,
  equippedWeapon,
  equippedShield,
  equippedSkin,
  equippedMount,
  equippedLegs,
  equippedAccessory,
  equippedBackground,
  equippedItemsData,
  size = 'md',
  animated = true,
  showEffects = true,
}: PixelAvatarProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size];

  // Buscar ícones dos itens
  const hatIcon = getItemIcon(equippedHat, equippedItemsData);
  const armorIcon = getItemIcon(equippedArmor, equippedItemsData);
  const weaponIcon = getItemIcon(equippedWeapon, equippedItemsData);
  const shieldIcon = getItemIcon(equippedShield, equippedItemsData);
  const mountIcon = getItemIcon(equippedMount, equippedItemsData);
  const legsIcon = getItemIcon(equippedLegs, equippedItemsData);
  const accessoryIcon = getItemIcon(equippedAccessory, equippedItemsData);
  const backgroundIcon = equippedBackground ? (getItemIcon(equippedBackground, equippedItemsData) || '🖼️') : null;

  // Verificar se tem itens lendários para efeitos especiais
  const hasLegendaryItem = equippedItemsData?.some(item => item.rarity === 'legendary');

  // Mapear UUID para ID de arquivo (caso o que venha seja o UUID do banco)
  const getBackgroundId = (id: string | null | undefined) => {
    if (!id) return null;
    if (!id.includes('-0000-')) return id; // Se não for UUID formatado, usa o próprio
    const found = SHOP_ITEMS.find(i => {
      // Deterministic hash check (mesma lógica do toSafeUUID)
      let hash = 0;
      for (let j = 0; j < i.id.length; j++) {
        hash = ((hash << 5) - hash) + i.id.charCodeAt(j);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      const uuid = `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
      return uuid === id;
    });
    return found?.id || id;
  };

  const bgId = getBackgroundId(equippedBackground);

  return (
    <div
      className={cn(
        "pixel-avatar-container",
        animated && "avatar-animated",
        hasLegendaryItem && showEffects && "legendary-glow"
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
        position: 'relative',
        backgroundColor: 'transparent',
        border: '4px solid #ffb700',
        borderRadius: '4px',
        overflow: 'hidden',
        isolation: 'isolate'
      }}
    >
      {/* 1. O CENÁRIO (BACKGROUND) - Ocupa todo o espaço base (Sincronizado com o pai) */}
      {bgId && (
        <img
          src={`/assets/sprites/background/${bgId}.png`}
          alt="Cenário"
          className="pixelated absolute inset-0 w-full h-full object-cover opacity-100"
          style={{
            zIndex: 0,
            imageRendering: 'pixelated'
          }}
        />
      )}

      {/* 2. MOLDURA - Camada que fica por cima do cenário mas abaixo do herói */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-20 bg-black/10" />

      {/* 3. PERSONAGEM E CAMADAS (Z-INDEX 10+) */}
      <div className="w-full h-full relative flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>

        {/* MONTARIA */}
        {mountIcon && (
          <EquipmentLayer
            slot="mount"
            icon={mountIcon}
            spriteUrl={`/assets/sprites/mount/${equippedMount}.png`}
            pixelSize={pixelSize}
            animated={animated}
          />
        )}

        {/* CORPO BASE - Removendo mix-blend se estiver causando o quadrado branco */}
        <div className="pixel-layer layer-body" style={{ zIndex: 10 }}>
          <img
            src={`/assets/images/class_${playerClass}.png`}
            alt={playerClass}
            className="body-sprite pixelated"
            style={{
              filter: 'contrast(110%) brightness(100%)'
            }}
          />
        </div>

        {/* OUTRAS CAMADAS */}
        {equippedSkin && <EquipmentLayer slot="skin" spriteUrl={`/assets/sprites/skin/${equippedSkin}.png`} pixelSize={pixelSize} animated={animated} />}
        {legsIcon && <EquipmentLayer slot="legs" icon={legsIcon} spriteUrl={`/assets/sprites/legs/${equippedLegs}.png`} pixelSize={pixelSize} animated={animated} />}
        {armorIcon && <EquipmentLayer slot="chest" icon={armorIcon} spriteUrl={`/assets/sprites/chest/${equippedArmor}.png`} pixelSize={pixelSize} animated={animated} />}
        {shieldIcon && <EquipmentLayer slot="shield" icon={shieldIcon} spriteUrl={`/assets/sprites/shield/${equippedShield}.png`} pixelSize={pixelSize} animated={animated} />}
        {hatIcon && <EquipmentLayer slot="head" icon={hatIcon} spriteUrl={`/assets/sprites/head/${equippedHat}.png`} pixelSize={pixelSize} animated={animated} />}
        {weaponIcon && <EquipmentLayer slot="weapon" icon={weaponIcon} spriteUrl={`/assets/sprites/weapon/${equippedWeapon}.png`} pixelSize={pixelSize} animated={animated} />}
        {accessoryIcon && <EquipmentLayer slot="accessory" icon={accessoryIcon} spriteUrl={`/assets/sprites/accessory/${equippedAccessory}.png`} pixelSize={pixelSize} animated={animated} />}

        {/* SOMBRA */}
        <div className="avatar-shadow" style={{ zIndex: 9 }} />
      </div>

      {/* 4. EFEITOS ESPECIAIS (Top most) */}
      {showEffects && hasLegendaryItem && <div className="legendary-particles" style={{ zIndex: 100 }} />}
    </div>
  );
}
