"use client"

import type { Game } from "@/lib/game/Game"

type InventoryProps = {
  game: Game
}

export const Inventory = ({ game }: InventoryProps): JSX.Element => {
  // TODO: 実際のインベントリデータをゲームから取得
  const inventorySlots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    item: null,
    count: 0,
  }))

  return (
    <div className="inventory">
      <h3>インベントリ</h3>
      <div className="inventory-items">
        {inventorySlots.map(slot => (
          <div key={slot.id} className="inventory-slot">
            {slot.count > 0 ? slot.count : ""}
          </div>
        ))}
      </div>
    </div>
  )
}