import React from 'react';
import moment from 'moment';
import { DatePicker, PickerDay } from "@mui/x-date-pickers";
import { Tooltip, Badge } from '@mui/material';
import { isEmpty, get } from 'lodash';


const ChipDatePicker = props => {
  const ref = React.useRef(null);
  const [value, setValue] = React.useState(null)
  const { date, defaultValue, badgedDates } = props;
  const onChange = mDate => {
    let date = null;
    if(mDate)
      date = mDate.format('YYYY-MM-DD')

    if(value || date)
      props.onChange(date);
  }

  const CustomPickerDay = dayProps => {
    const { day, selected } = dayProps;
    if(!badgedDates || isEmpty(badgedDates) || selected)
      return <PickerDay {...dayProps} />;
    const fDate = day.format('DD-MM-YYYY')
    const count = get(badgedDates, fDate)
    if(count) {
      return (
        <Tooltip title={`${count} imports`} arrow>
          <Badge badgeContent={count} color="primary" variant="dot" overlap="circular">
            <PickerDay {...dayProps} />
          </Badge>
        </Tooltip>
      );
    }
    return <PickerDay {...dayProps} />;
  }

  const toMomentValue = val => val ? moment(val) : null

  React.useEffect(
    () => setValue(toMomentValue(defaultValue || date)), [defaultValue]
  )

  React.useEffect(
    () => setValue(toMomentValue(defaultValue || date)), [date]
  )


  const getComponent = () => {
    return (
      <span id='chip-date-picker'>
          <DatePicker
            disableFuture
            openTo='day'
            views={['year', 'month', 'day']}
            slotProps={{
              textField: { size: 'small', error: false },
              popper: { anchorEl: ref.current }
            }}
            value={value}
            onChange={onChange}
            format="MM/DD/YYYY"
            slots={{
              day: CustomPickerDay
            }}
          />
      </span>
    )
  }

  return (
      props.tooltip ?
        <Tooltip arrow title={props.tooltip}>
          {getComponent()}
        </Tooltip> :
      getComponent()
  )
}

export default ChipDatePicker;
