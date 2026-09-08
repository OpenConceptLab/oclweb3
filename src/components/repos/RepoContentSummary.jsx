import React from 'react'
import { useTranslation } from 'react-i18next';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import ReferenceIcon from '@mui/icons-material/LocalOfferOutlined';
import ExpansionIcon from '@mui/icons-material/AspectRatioOutlined';
import isNumber from 'lodash/isNumber'
import isEmpty from 'lodash/isEmpty'
import max from 'lodash/max'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'

export const REPO_STATS = ['concepts', 'mappings', 'references', 'expansions', 'versions']
export const VERSION_STATS = ['concepts', 'mappings', 'references', 'expansions']

const ICON_WIDTH = 16
const ICON_GAP = 4
const STAT_GAP = 8
const DEFAULT_WIDTH = 4

const format = value => isNumber(value) ? value.toLocaleString() : '-'

/*
 * Counts from a repo's (or repo version's) `summary`, so a repo row and its
 * version rows read alike.
 *
 * `summaries` is every summary the table is rendering. Each stat then reserves
 * exactly as many digits as the widest count in its column needs, which keeps
 * the stats in line down the column without the padding a one-size-fits-all
 * width would leave on a table of small counts.
 */
const RepoContentSummary = ({ summary, stats, summaries, baseURL }) => {
  const { t } = useTranslation()

  if(isEmpty(summary))
    return null

  const CONFIG = {
    concepts: {
      key: 'active_concepts',
      tab: 'concepts',
      label: t('concept.concepts'),
      icon: <ConceptIcon selected color='secondary' sx={{width: '1rem', height: '1rem'}} />
    },
    mappings: {
      key: 'active_mappings',
      tab: 'mappings',
      label: t('mapping.mappings'),
      icon: <MappingIcon width='15px' height='13px' fill='secondary.main' color='secondary' />
    },
    // only collections carry references and expansions, so these stats drop out
    // for a source rather than sitting there as placeholders
    references: {
      key: 'active_references',
      tab: 'references',
      label: t('reference.references'),
      optional: true,
      icon: <ReferenceIcon color='secondary' sx={{fontSize: '1rem'}} />
    },
    expansions: {
      key: 'expansions',
      tab: 'versions',
      label: t('repo.expansions'),
      optional: true,
      icon: <ExpansionIcon color='secondary' sx={{fontSize: '1rem'}} />
    },
    versions: {
      key: 'versions',
      tab: 'versions',
      label: t('common.versions'),
      icon: <VersionIcon color='secondary' sx={{fontSize: '1rem'}} />
    },
  }

  const getWidth = statKey => {
    const widest = summaries?.length ?
      max(summaries.map(each => format(each?.[statKey]).length)) :
      format(summary[statKey]).length
    return `calc(${ICON_WIDTH + ICON_GAP + STAT_GAP}px + ${widest || DEFAULT_WIDTH}ch)`
  }

  return (
    <Stack direction='row' sx={{alignItems: 'center'}}>
      {
        (stats || REPO_STATS).filter(
          stat => !CONFIG[stat].optional || isNumber(summary[CONFIG[stat].key])
        ).map(stat => (
          <Tooltip key={stat} title={CONFIG[stat].label}>
            {/* the reserved width holds the stats in line across rows; the padding
                is what separates them, so nothing runs into the next stat */}
            <Stack
              direction='row'
              spacing={`${ICON_GAP}px`}
              sx={{
                alignItems: 'center',
                minWidth: getWidth(CONFIG[stat].key),
                pr: `${STAT_GAP}px`,
                ...(baseURL ? {cursor: 'pointer', '&:hover .MuiTypography-root': {textDecoration: 'underline'}} : {})
              }}
              {...(baseURL ? {
                // the stat opens the tab it counts, without also firing the row's click
                component: Link,
                href: `#${baseURL}${CONFIG[stat].tab}/`,
                onClick: event => event.stopPropagation(),
                underline: 'none',
                color: 'inherit'
              } : {})}
            >
              <Stack sx={{alignItems: 'center', justifyContent: 'center'}}>
                {CONFIG[stat].icon}
              </Stack>
              <Typography variant='body2' sx={{fontVariantNumeric: 'tabular-nums'}}>
                {format(summary[CONFIG[stat].key])}
              </Typography>
            </Stack>
          </Tooltip>
        ))
      }
    </Stack>
  )
}

export default RepoContentSummary;
