import React from 'react';
import {useTranslation} from 'react-i18next'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  Drawer, Checkbox,
} from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { map, keys } from 'lodash';

const getItemStyle = draggableStyle => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  // styles we need to apply on draggables
  ...draggableStyle,
});
const getListStyle = () => ({
  overflow: 'hidden',
});

const ComparisonAttributes = ({attributes, open, onClose, onCheckboxClick, onDragEnd}) => {
  const { t } = useTranslation()

  return (
    <Drawer anchor='left' open={open} onClose={onClose} sx={{'.MuiPaper-root': {top: '64px'}}}>
      <div className='col-md-4' style={{width: '300px'}}>
        <h3>
          {t('common.toggle_attributes')}:
        </h3>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="comparison-attrs-droppable">
            {
              (provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                  >
                  {
                    map(keys(attributes), (attr, index) => (
                      <Draggable key={attr} draggableId={attr} index={index}>
                        {
                          provided => (
                            <div>
                              <div
                                className='col-md-12 flex-vertical-center'
                                ref={provided.innerRef}
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                style={getItemStyle(provided.draggableProps.style)}
                              >
                                <DragIndicator />
                                <Checkbox checked={attributes[attr].show} onChange={() => onCheckboxClick(attr)} />
                                {attr}
                              </div>
                              {provided.placeholder}
                            </div>
                          )
                        }
                      </Draggable>
                    ))
                  }
                  {provided.placeholder}
                </div>
              )
            }
          </Droppable>
        </DragDropContext>
      </div>
    </Drawer>
  )
}

export default ComparisonAttributes;
