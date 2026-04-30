import React from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button as MuiButton
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import {
  get,
  set,
  isBoolean,
  isString,
  map,
  uniq,
  has,
  forEach,
  pickBy,
  values
} from "lodash";
import { useTranslation } from "react-i18next";

import APIService from "../../services/APIService";
import { dropVersion } from "../../common/utils";
import { OperationsContext } from "../app/LayoutContext";
import Dialog from "../common/Dialog";
import DialogTitle from "../common/DialogTitle";
import CloseIconButton from "../common/CloseIconButton";

const PARAMETER_CONFIG = {
  filter: { supported: true },
  activeOnly: { supported: true },
  date: {
    supported: true,
    regex: /([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?/gm,
    format: "YYYY, YYYY-MM, YYYY-MM-DD or YYYY-MM-DD hh:mm:ss"
  },
  count: { supported: false },
  offset: { supported: false },
  includeDesignations: { supported: false },
  includeDefinition: { supported: false },
  excludeNested: { supported: false },
  excludeNotForUI: { supported: false },
  excludePostCoordinated: { supported: false },
  "exclude-system": { supported: true },
  "system-version": { supported: true },
  "check-system-version": { supported: false },
  "force-system-version": { supported: false }
};

const defaultFields = () => ({
  mnemonic: "",
  canonical_url: "",
  parameters: {
    filter: "",
    "exclude-system": "",
    "system-version": "",
    date: "",
    count: 0,
    offset: 0,
    activeOnly: false,
    includeDesignations: true,
    includeDefinition: false,
    excludeNested: true,
    excludeNotForUI: true,
    excludePostCoordinated: true,
    "check-system-version": "",
    "force-system-version": ""
  }
});

const getVersionEndpoint = version => {
  const versionURL = version?.version_url || version?.url || "";
  return version?.version === "HEAD"
    ? `${dropVersion(versionURL)}HEAD/`
    : versionURL;
};

const fieldSx = {
  background: "none",
  "& .MuiFormHelperText-root": {
    mx: 0,
    px: 1.75,
    pb: 0.25
  }
};

const ExpansionForm = ({
  open,
  onClose,
  versions = [],
  version,
  copyFrom,
  onSubmitSuccess
}) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);

  const getInitialState = React.useCallback(() => {
    const fields = defaultFields();
    const source = copyFrom;
    if (source) {
      fields.mnemonic = "";
      fields.canonical_url = source.canonical_url || "";
      forEach(fields.parameters, (value, key) => {
        if (has(source.parameters, key))
          fields.parameters[key] = source.parameters[key];
      });
    }

    return {
      selectedVersion: version || null,
      fields,
      fieldErrors: {},
      helperTexts: {},
      saving: false
    };
  }, [copyFrom, version]);

  const [state, setState] = React.useState(getInitialState);
  const { selectedVersion, fields, fieldErrors, helperTexts, saving } = state;

  React.useEffect(() => {
    setState(getInitialState());
  }, [getInitialState, open]);

  const setFieldValue = (path, value) => {
    setState(prev => {
      const next = { ...prev };
      set(next, path, value);
      return next;
    });
  };

  const onRegexTextFieldChange = (event, parameter) => {
    const { value, id } = event.target;
    const fieldId = id.replace("fields.parameters.", "");
    const re = new RegExp(parameter.regex);
    const matches = value.match(re);
    const nextState = {
      ...state,
      fields: { ...state.fields, parameters: { ...state.fields.parameters } }
    };
    nextState.fields.parameters[fieldId] = value;

    if (matches) {
      nextState.fieldErrors[fieldId] = undefined;
      const newValue = uniq(matches).join(",");
      nextState.helperTexts[fieldId] =
        newValue !== value
          ? t("repo.version.expansion_form.cleaned_values", {
              values: newValue
            })
          : undefined;
    } else if (value) {
      nextState.helperTexts[fieldId] = undefined;
      nextState.fieldErrors[fieldId] = t(
        "repo.version.expansion_form.format_hint",
        {
          format: parameter.format
        }
      );
    } else {
      nextState.helperTexts[fieldId] = undefined;
      nextState.fieldErrors[fieldId] = undefined;
    }

    setState(nextState);
  };

  const onRegexTextFieldBlur = (event, parameter) => {
    const { value, id } = event.target;
    const fieldId = id.replace("fields.parameters.", "");
    const helperText = get(helperTexts, fieldId);
    const error = get(fieldErrors, fieldId);

    if (helperText && !error) {
      const re = new RegExp(parameter.regex);
      const matches = value.match(re);
      if (matches)
        setFieldValue(`fields.parameters.${fieldId}`, uniq(matches).join(","));
    }
  };

  const getPayload = () => ({
    mnemonic: fields.mnemonic,
    canonical_url: fields.canonical_url || undefined,
    parameters: pickBy(
      fields.parameters,
      value => value !== "" && value !== null && value !== undefined
    )
  });

  const onSubmit = event => {
    event.preventDefault();
    event.stopPropagation();

    const payload = getPayload();

    if (!payload.mnemonic) {
      setState(prev => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          mnemonic: t("repo.version.expansion_form.id_required")
        }
      }));
      return;
    }

    if (!selectedVersion) {
      setAlert({
        severity: "error",
        message: t("repo.version.expansion_form.version_required")
      });
      return;
    }

    setState(prev => ({ ...prev, saving: true }));

    const request = APIService.new()
      .overrideURL(getVersionEndpoint(selectedVersion))
      .appendToUrl("expansions/")
      .post(payload);

    request.then(response => {
      setState(prev => ({ ...prev, saving: false }));
      if (response?.status === 200 || response?.status === 201) {
        setAlert({
          severity: "success",
          message: t("repo.version.expansion_form.created")
        });
        onSubmitSuccess(response?.data || payload);
        onClose();
      } else {
        const genericError = get(response, "__all__");
        setAlert({
          severity: "error",
          message:
            genericError?.join("\n") ||
            get(response, "detail") ||
            values(response || {}).join("\n") ||
            t("common.generic_error")
        });
      }
    });
  };

  const title = t("repo.version.expansion_form.new_title", {
    version:
      selectedVersion?.version ||
      selectedVersion?.id ||
      t("repo.version.expansion_form.select_version")
  });

  return (
    <Dialog open={Boolean(open)} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <CloseIconButton
          aria-label={t("common.close")}
          onClick={onClose}
          sx={{ color: "secondary.main", mt: -0.5, mr: -1, fontSize: "22px" }}
        />
      </Box>
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
        <Stack spacing={2}>
          <TextField
            error={Boolean(fieldErrors.mnemonic)}
            id="fields.mnemonic"
            label={t("repo.version.form.id.label")}
            value={fields.mnemonic}
            onChange={event =>
              setFieldValue("fields.mnemonic", event.target.value)
            }
            fullWidth
            required
            helperText={t("repo.version.form.id.helper_text")}
            inputProps={{ pattern: "[a-zA-Z0-9-._@]+" }}
            sx={fieldSx}
          />

          <Autocomplete
            openOnFocus
            disableClearable
            value={selectedVersion}
            options={versions}
            getOptionLabel={option => option?.version || option?.id || ""}
            isOptionEqualToValue={(option, value) =>
              (option?.version_url || option?.url) ===
              (value?.version_url || value?.url)
            }
            onChange={(event, item) =>
              setState(prev => ({ ...prev, selectedVersion: item }))
            }
            renderInput={params => (
              <TextField
                {...params}
                label={t("repo.version.expansion_form.collection_version")}
                fullWidth
                required
                sx={fieldSx}
              />
            )}
          />

          <TextField
            error={Boolean(fieldErrors.canonical_url)}
            id="fields.canonical_url"
            label={t("repo.canonical_url")}
            value={fields.canonical_url}
            onChange={event =>
              setFieldValue("fields.canonical_url", event.target.value)
            }
            fullWidth
            sx={fieldSx}
          />

          <Box>
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 700,
                color: "surface.contrastText",
                mb: 1
              }}
            >
              {t("repo.version.expansion_form.parameters")}
            </Typography>

            <Box
              sx={{
                display: "grid",
                // eslint-disable-next-line spellcheck/spell-checker
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                gap: 1,
                alignItems: "start",
                "@media (max-width:700px)": {
                  gridTemplateColumns: "1fr"
                }
              }}
            >
              {map(pickBy(fields.parameters, isBoolean), (value, attr) => {
                const parameter = PARAMETER_CONFIG[attr];
                return (
                  <FormControlLabel
                    key={attr}
                    sx={{
                      m: 0,
                      minHeight: "42px",
                      alignItems: "flex-start",
                      ".MuiFormControlLabel-label": { pt: "9px" }
                    }}
                    control={
                      <Checkbox
                        checked={Boolean(fields.parameters[attr])}
                        onChange={event =>
                          setFieldValue(
                            `fields.parameters.${attr}`,
                            event.target.checked
                          )
                        }
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5
                        }}
                      >
                        <span>
                          {t(
                            `repo.version.expansion_form.parameters_fields.${attr}.label`
                          )}
                        </span>
                        <Tooltip
                          title={t(
                            `repo.version.expansion_form.parameters_fields.${attr}.tooltip`
                          )}
                        >
                          <InfoIcon
                            color={parameter.supported ? "primary" : "disabled"}
                            fontSize="small"
                          />
                        </Tooltip>
                      </Box>
                    }
                  />
                );
              })}
            </Box>

            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {map(pickBy(fields.parameters, isString), (value, attr) => {
                const parameter = PARAMETER_CONFIG[attr];
                return (
                  <TextField
                    key={attr}
                    error={Boolean(fieldErrors[attr])}
                    id={`fields.parameters.${attr}`}
                    label={t(
                      `repo.version.expansion_form.parameters_fields.${attr}.label`
                    )}
                    value={fields.parameters[attr]}
                    onChange={event =>
                      parameter.regex
                        ? onRegexTextFieldChange(event, parameter)
                        : setFieldValue(
                            `fields.parameters.${attr}`,
                            event.target.value
                          )
                    }
                    onBlur={event =>
                      parameter.regex
                        ? onRegexTextFieldBlur(event, parameter)
                        : null
                    }
                    fullWidth
                    helperText={
                      fieldErrors[attr] ||
                      helperTexts[attr] ||
                      t(
                        `repo.version.expansion_form.parameters_fields.${attr}.tooltip`
                      )
                    }
                    sx={fieldSx}
                  />
                );
              })}
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="flex-end">
            <MuiButton
              type="submit"
              variant="contained"
              sx={{ textTransform: "none" }}
              disabled={saving}
            >
              {t("common.create")}
            </MuiButton>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default ExpansionForm;
