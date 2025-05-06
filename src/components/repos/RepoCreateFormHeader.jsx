import React from 'react'
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import BackIcon from '@mui/icons-material/ArrowBackSharp';
import { SURFACE_COLORS, WHITE } from '../../common/colors'
import RepoIcon from '../repos/RepoIcon'

const RepoCreateFormHeader = ({repoTypeLabel, repoTypeDescriptionNode, onBack, isEdit, icon, header}) => {
  const { t } = useTranslation()
  return (
    <>
      <div className='col-xs-12' style={{padding: '16px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div className='col-xs-12' style={{padding: '0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: '56px', height: '54px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 16px', borderRadius: '10px', border: 'solid 1px', borderColor: SURFACE_COLORS.nv80, backgroundColor: WHITE}}>
            {
              icon ? icon :
                <RepoIcon noTooltip sx={{color: 'primary.main'}} />
            }
          </div>
        </div>
        <div className='col-xs-12' style={{padding: '0', textAlign: 'center', marginTop: '8px'}}>
          <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {
              onBack &&
                <IconButton onClick={onBack}>
                  <BackIcon sx={{color: 'secondary.light'}}/>
                </IconButton>
            }
            {
              header ?
              <Typography component='span' sx={{color: repoTypeLabel ? 'secondary.light' : 'surface.dark', fontSize: '22px'}}>
                {header}
              </Typography> :
              <>
                {
                  !isEdit &&
                    <Typography component='span' sx={{color: repoTypeLabel ? 'secondary.light' : 'surface.dark', fontSize: '22px'}}>
                      {t('repo.create_a_repo')} {repoTypeLabel ? '/' : ''}
                    </Typography>
                }
                {
                  repoTypeLabel &&
                    <Typography component='span' sx={{color: 'surface.dark', fontSize: '22px', marginLeft: '5px'}}>
                      {repoTypeLabel}
                    </Typography>
                }
              </>
            }
          </span>
          {
            repoTypeDescriptionNode ?
              <div className='col-xs-12' style={{marginTop: '8px', color: SURFACE_COLORS.contrastText}}>
                {repoTypeDescriptionNode}
              </div>
            : null
          }
        </div>
      </div>
    </>
  )
}


export default RepoCreateFormHeader
