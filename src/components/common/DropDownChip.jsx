import React from 'react';
import { styled } from '@mui/material/styles';
import { Chip, Popper, Box, InputBase } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import FormControl from '@mui/material/FormControl'
import DoneIcon from '@mui/icons-material/Done';

const StyledAutocompletePopper = styled('div')(({ theme }) => ({
  [`& .${autocompleteClasses.paper}`]: {
    boxShadow: 'none',
    margin: 0,
    color: 'inherit',
    fontSize: 13,
  },
  [`& .${autocompleteClasses.listbox}`]: {
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
    padding: 0,
    [`& .${autocompleteClasses.option}`]: {
      minHeight: 'auto',
      alignItems: 'flex-start',
      padding: 8,
      borderBottom: `1px solid  ${
        theme.palette.mode === 'light' ? ' #eaecef' : '#30363d'
      }`,
      '&[aria-selected="true"]': {
        backgroundColor: 'transparent',
      },
      '&[data-focus="true"], &[data-focus="true"][aria-selected="true"]': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
  [`&.${autocompleteClasses.popperDisablePortal}`]: {
    position: 'relative',
  },
}));


const PopperComponent = props => {
  // eslint-disable-next-line no-unused-vars
  const { disablePortal, anchorEl, open, ...other } = props;
  return <StyledAutocompletePopper {...other} />;
}


const StyledPopper = styled(Popper)(({ theme }) => ({
  border: `1px solid ${theme.palette.mode === 'light' ? '#e1e4e8' : '#30363d'}`,
  boxShadow: `0 8px 24px ${
    theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'
  }`,
  borderRadius: 6,
  minWidth: 100,
  maxWidth: 200,
  zIndex: theme.zIndex.modal,
  fontSize: 13,
  color: theme.palette.mode === 'light' ? '#24292e' : '#c9d1d9',
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#1c2128',
}));


const StyledInput = styled(InputBase)(({ theme }) => ({
  padding: 10,
  width: '100%',
  borderBottom: `1px solid ${
    theme.palette.mode === 'light' ? '#eaecef' : '#30363d'
  }`,
  '& input': {
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#0d1117',
    padding: 8,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    border: `1px solid ${theme.palette.mode === 'light' ? '#eaecef' : '#30363d'}`,
    fontSize: 14,
    '&:focus': {
      boxShadow: `0px 0px 0px 3px ${
        theme.palette.mode === 'light'
          ? 'rgba(3, 102, 214, 0.3)'
          : 'rgb(12, 45, 107)'
      }`,
      borderColor: theme.palette.mode === 'light' ? '#0366d6' : '#388bfd',
    },
  },
}));


class DropDownChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      selected: null,
      searchedValue: undefined,
    };
  }

  componentDidMount() {
    this.setDefault();
  }

  componentDidUpdate(prevProps) {
    if(this.shouldSetDefault(prevProps))
      this.setDefault();
  }

  shouldSetDefault(prevProps) {
    const { defaultValue } = this.props;
    const { selected } = this.state;
    return prevProps.defaultValue !== defaultValue && defaultValue && selected !== defaultValue;
  }

  setDefault() {
    const { defaultValue } = this.props;
    if(defaultValue)
      this.setState({selected: defaultValue}, this.afterSelect);
  }

  setAnchorEl = event => {
    if(event?.key !== 'Enter')
      this.setState({anchorEl: document.getElementById(this.props.id || 'chip-list')});
  };

  close = () => this.setState({anchorEl: null, searchedValue: undefined});

  afterSelect() {
    this.close();
    if(this.props.onChange)
      this.props.onChange(this.state.selected);
  }

  handleSelect(value) {
    if(value !== this.state.selected)
      this.setState({selected: value}, this.afterSelect);
  }

  render() {
    const { selected, anchorEl } = this.state;
    const { disabled, options, sx, label, color } = this.props;
    const open = Boolean(anchorEl)
    return (
      <FormControl sx={{...sx}}>
        <Chip
          id={this.props.id || "chip-list"}
          label={selected}
          deleteIcon={<ArrowDropDown />}
          variant='outlined'
          clickable
          onDelete={this.setAnchorEl}
          onClick={this.setAnchorEl}
          color={color || "primary"}
          disabled={disabled}
          sx={{height: "40px"}}
        />
        <StyledPopper id={open ? 'locale-selector' : undefined} open={open} anchorEl={anchorEl} placement="bottom-start">
        <ClickAwayListener onClickAway={this.close}>
          <div>
            <Box
              sx={{
                borderBottom: `1px solid #eaecef`,
                padding: '8px 10px',
                fontWeight: 600,
              }}
            >
              {label}
            </Box>
            <Autocomplete
              open
              onClose={(event, reason) => {
                if (reason === 'escape') {
                  this.close();
                }
              }}
              value={selected}
              onChange={(event, newValue, reason) => {
                if (
                  event.type === 'keydown' &&
                  event.key === 'Backspace' &&
                  reason === 'removeOption'
                ) {
                  return;
                }
                if(newValue)
                  this.handleSelect(newValue);
              }}
              PopperComponent={PopperComponent}
              noOptionsText="No matches found"
              renderOption={(props, option, { selected }) => (
                <li {...props} style={selected ? {backgroundColor: 'rgba(106, 174, 32, 0.12)'} : {}}>
                  <Box
                    component={DoneIcon}
                    sx={{ width: 17, height: 17, mr: '5px', ml: '-2px' }}
                    style={{
                      visibility: selected ? 'visible' : 'hidden',
                    }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      '& span': {
                        color: '#586069',
                      },
                    }}
                  >
                    {option}
                  </Box>
                </li>
              )}
              options={options}
              getOptionLabel={(option) => option}
              renderInput={(params) => (
                <StyledInput
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  autoFocus
                />
              )}
            />
          </div>
        </ClickAwayListener>
      </StyledPopper>
      </FormControl>
    );
  }
}

export default DropDownChip;
