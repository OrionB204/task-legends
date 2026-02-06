# Plano de Implementação - Sistema de Atributos Habitica

## Objetivo
Implementar sistema completo de atributos baseado no Habitica com as seguintes funcionalidades:

### 1. Atributos do Jogo (Apenas os 4 do Habitica)
- **Strength (Força)**: Aumenta dano em Raids (5% por ponto) e chance de crítico (0.4% por ponto)
- **Intelligence (Inteligência)**: Aumenta XP ganho (2% por ponto) e Mana Máxima
- **Constitution (Constituição)**: Reduz dano recebido (1% por ponto, máx 75%) e aumenta HP Máximo
- **Perception (Percepção)**: 
  - Aumenta Gold ganho (+1 por ponto)
  - **NOVO**: Chance de esquivar de contra-ataques de BOSS (0.5% por ponto)

### 2. Etapas de Implementação

#### PARTE 1: Atualizar Equipamentos ✅
- [x] Mapear todos os atributos antigos (agility, vitality, endurance, damage, hp, mana) para os 4 do Habitica
- [ ] Atualizar arquivo shopItems.ts com novos atributos

#### PARTE 2: Sincronizar com Classes
- [ ] Garantir que CLASS_BASE_STATS está correto
- [ ] Verificar se os bônus de classe estão aplicados corretamente

#### PARTE 3: Implementar Mecânica de Percepção (Esquiva)
- [ ] Adicionar função `calculateDodgeChance(perception)` em gameFormulas.ts
- [ ] Modificar `handleBossCounterAttack` para considerar percepção individual
- [ ] Testar mecânica de esquiva

#### PARTE 4: Corrigir Consumíveis
- [ ] Verificar por que poções não estão curando HP
- [ ] Corrigir lógica de consumo em useInventory.ts
- [ ] Testar poções de HP e Mana

### 3. Mapeamento de Atributos

| Atributo Antigo | Atributo Habitica | Justificativa |
|-----------------|-------------------|---------------|
| agility         | perception        | Agilidade = Percepção no contexto do Habitica |
| vitality        | constitution      | Vitalidade = Constituição |
| endurance       | constitution      | Resistência = Constituição |
| damage          | strength          | Dano = Força |
| hp (bônus)      | constitution      | HP extra = Constituição |
| mana (bônus)    | intelligence      | Mana extra = Inteligência |
| xpBonus         | REMOVER          | Não é atributo base |
| goldBonus       | REMOVER          | Não é atributo base |

### 4. Fórmulas

#### Percepção - Esquiva de Contra-ataques
```typescript
function calculateDodgeChance(perception: number): number {
  return Math.min(perception * 0.005, 0.50); // 0.5% por ponto, máximo 50%
}
```

#### Aplicação na RAID
Quando o Boss tentar contra-atacar:
1. Calcular chance base de acerto do Boss (10%)
2. Para cada jogador, calcular chance de esquiva baseada em percepção
3. Se esquivar, não tomar dano
4. Log individual de esquiva ou acerto
