import { Button, FocusModal, Select } from "@medusajs/ui"
import React, { useState } from 'react';
import './style.css'

const InventoriesModal = ({ open, setOpenModal, inventories, receiveSelectedInventory }) => {
    const [selectedVarient, setSelectedVarient] = useState<any>();
    const [optionSelected, setOptionSelected] = useState<boolean>(true);
      
    const onInventorySelect = (selectedOption) => {
        setSelectedVarient(selectedOption);
        setOptionSelected(false);
      };

      const confirmSelect = () => {
        receiveSelectedInventory(selectedVarient);
        setOptionSelected(true);
      }

      

  return (
    <FocusModal
    open={open}
      onOpenChange={setOpenModal}
    >
      <FocusModal.Trigger></FocusModal.Trigger>
      
      <FocusModal.Content>
        <FocusModal.Header></FocusModal.Header>
        <FocusModal.Body>
            <div className="inventory-modal">
            <Select onValueChange={onInventorySelect}>
  <Select.Trigger>
    <Select.Value placeholder="Placeholder" />
  </Select.Trigger>
  <Select.Content>
    {inventories.map((inventory) => (
      <Select.Item key={inventory.id} value={inventory}>
        {inventory.name}
      </Select.Item>
    ))}
  </Select.Content>
</Select><Button onClick={confirmSelect} disabled={optionSelected}>Confirm</Button>

            </div>
        

        </FocusModal.Body>
      </FocusModal.Content>
      
      
    </FocusModal>
  )
}

export default InventoriesModal;
