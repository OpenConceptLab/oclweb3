import React from 'react';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/PlaylistAddOutlined'

import { COLORS } from '../../common/colors';
import { isAtGlobalSearch, isLoggedIn } from '../../common/utils';
import ConceptListItem from './ConceptListItem'
import AddToCollectionDialog from '../common/AddToCollectionDialog'

const ConceptCard = ({ concept, onSelect, isSelected, onCardClick, bgColor, isShown, firstChild }) => {
  const id = concept.version_url || concept.url || concept.id
  const isChecked = isSelected(id)
  const isSelectedToShow = isShown(id)
  const [addToCollectionOpen, setAddToCollectionOpen] = React.useState(false)
  const border = (isChecked || isSelectedToShow) ? `1px solid ${COLORS.primary.main}` : '0.3px solid rgba(0, 0, 0, 0.12)'

  return (
    <Card
      variant='outlined'
      className={'col-xs-12' + (isSelectedToShow ? ' show-item' : '')}
      sx={[{
        padding: '4px 16px',
        border: border,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
      }, firstChild ? {
        margin: '0 0 4px 0'
      } : {
        margin: '4px 0'
      }, isSelectedToShow ? {
        backgroundColor: 'primary.90'
      } : {
        backgroundColor: bgColor
      }, isSelectedToShow ? {
        '&:hover': {
          backgroundColor: 'primary.90'
        }
      } : {
        '&:hover': {
          backgroundColor: 'primary.95'
        }
      }]}
      onClick={event => onCardClick(event, id)}
    >
      <div className='col-xs-1 padding-0' style={{maxWidth: '24px'}}>
        <Checkbox
          color="primary"
          checked={isChecked}
          style={{padding: 0}}
          onClick={event => onSelect(event, id)}
        />
      </div>
      <div className='col-xs-11' style={{width: 'calc(100% - 24px)'}}>
        <ConceptListItem concept={concept} showSource={isAtGlobalSearch()} sx={{padding: 0}} />
        {isChecked && isLoggedIn() && (
          <Button
            startIcon={<AddIcon fontSize='inherit' />}
            variant='text'
            size='small'
            color='primary'
            sx={{textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0}}
            onClick={event => { event.stopPropagation(); setAddToCollectionOpen(true) }}
          >
            Add to Collection
          </Button>
        )}
      </div>
      <AddToCollectionDialog
        open={addToCollectionOpen}
        onClose={() => setAddToCollectionOpen(false)}
        concept={concept}
      />
    </Card>
  );
}

export default ConceptCard;
