import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Checkbox,
  Button,
  Divider,
  Badge
} from "@mui/material";
import forEach from 'lodash/forEach'

const DEFAULT_FILTERS = {
  // any | true | false
  resource_versioned: "any",
  repo_versioned: "any",

  // any | none | source_to_concepts | source_mappings
  cascade: "any",

  // any | intensional | extensional
  transform: "any",

  // include/exclude: null | true
  include: null,
  exclude: null
};

const ReferenceFilters = ({ onChange, heightToSubtract }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  const toggleGroupValue = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? "any" : value
    }));
  };

  // Keep your include/exclude checkbox semantics:
  // checked => true, unchecked => null (means "not filtering")
  const toggleNullableTrue = (key, value) => () => {
    const checked = value;
    setFilters(prev => ({
      ...prev,
      [key]: checked ? true : null
    }));
  };

  const onApply = () => {
    const params = {};

    if (filters.resource_versioned !== "any") {
      params.resource_versioned = filters.resource_versioned; // "true" / "false"
    }

    if (filters.repo_versioned !== "any") {
      params.repo_versioned = filters.repo_versioned; // "true" / "false"
    }

    if (filters.cascade !== "any") {
      params.cascade = filters.cascade === "none" ? "false" : filters.cascade;
    }

    if (filters.transform === "intensional") {
      params.intensional = "true";
    } else if (filters.transform === "extensional") {
      params.extensional = "true";
    }

    if (filters.include !== null) params.include = "true";
    if (filters.exclude !== null) params.exclude = "true";
    let newParams = {}
    forEach(params, (value, key) => {
      if(value === 'true')
        newParams[key] = true
      else if (value === 'false')
        newParams[key] = false
      else if (key === 'cascade')
        newParams[key] = value
      else if(key === 'transform') {
        if(value === 'intensional')
          newParams.intensional = true
        if(value === 'extensional')
          newParams.extensional = true
      }
    })
    onChange?.(newParams);
  };

  const onClear = () => {
    setFilters(DEFAULT_FILTERS);
    onChange?.({});
  };

  const count = React.useMemo(() => {
    let c = 0;
    if (filters.resource_versioned !== "any") c += 1;
    if (filters.repo_versioned !== "any") c += 1;
    if (filters.cascade !== "any") c += 1;
    if (filters.transform !== "any") c += 1;
    if (filters.include !== null) c += 1;
    if (filters.exclude !== null) c += 1;
    return c;
  }, [filters]);

  return (
    <Box
      className="col-xs-12 padding-0"
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid",
        borderColor: "divider"
      }}
    >
      <div
        className="col-xs-12"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 8px"
        }}
      >
        <span>
          <Badge
            badgeContent={count}
            color="primary"
            sx={{ ".MuiBadge-badge": { top: "10px", left: "36px" } }}
          >
            <b>{t("search.filters")}</b>
          </Badge>
        </span>
        <span>
          <Button
            variant="text"
            color="primary"
            style={{ textTransform: "none" }}
            onClick={onApply}
          >
            {t("common.apply")}
          </Button>
          <Button
            variant="text"
            style={{ textTransform: "none" }}
            onClick={onClear}
            disabled={!count}
            color="error"
          >
            {t("common.clear")}
          </Button>
        </span>
      </div>

      <div
        className="col-xs-12 padding-0"
        style={{
          height: `calc(100vh - ${heightToSubtract || 0}px - 56px)`,
          overflowY: "auto"
        }}
      >
        <List dense subheader={<li />} sx={{ p: 0 }}>
          {/* Resource Versioned */}
          <li>
            <ul style={{ paddingLeft: 0 }}>
              <ListSubheader
                sx={{
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 0,
                  paddingLeft: "12px",
                  lineHeight: "32px"
                }}
              >
                Resource Versioned
              </ListSubheader>

              {/* Resource Versioned: true/false */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("resource_versioned", "true")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.resource_versioned === "true"}
                  />
                </ListItemIcon>
                <ListItemText primary="True" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("resource_versioned", "false")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.resource_versioned === "false"}
                  />
                </ListItemIcon>
                <ListItemText primary="False" />
              </ListItemButton>
            </ul>
          </li>

          <Divider sx={{ marginTop: "8px" }} />

          <li>
            <ul style={{ paddingLeft: 0 }}>
              <ListSubheader
                sx={{
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 0,
                  paddingLeft: "12px",
                  lineHeight: "32px"
                }}
              >
                Repo Versioned
              </ListSubheader>

              {/* Repo Versioned: true/false */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("repo_versioned", "true")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.repo_versioned === "true"}
                  />
                </ListItemIcon>
                <ListItemText primary="True" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("repo_versioned", "false")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.repo_versioned === "false"}
                  />
                </ListItemIcon>
                <ListItemText primary="False" />
              </ListItemButton>
            </ul>
          </li>

          <Divider sx={{ marginTop: "8px" }} />

          {/* Transform */}
          <li>
            <ul style={{ paddingLeft: 0 }}>
              <ListSubheader
                sx={{
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 0,
                  paddingLeft: "12px",
                  lineHeight: "32px"
                }}
              >
                Transform
              </ListSubheader>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("transform", "intensional")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.transform === "intensional"}
                  />
                </ListItemIcon>
                <ListItemText primary="Intensional" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("transform", "extensional")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.transform === "extensional"}
                  />
                </ListItemIcon>
                <ListItemText primary="Extensional" />
              </ListItemButton>
            </ul>
          </li>

          <Divider sx={{ marginTop: "8px" }} />

          {/* Cascade */}
          <li>
            <ul style={{ paddingLeft: 0 }}>
              <ListSubheader
                sx={{
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 0,
                  paddingLeft: "12px",
                  lineHeight: "32px"
                }}
              >
                Cascade
              </ListSubheader>

              {/* None => cascade=false */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "true")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "true"}
                  />
                </ListItemIcon>
                <ListItemText primary="Any" />
              </ListItemButton>
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "false")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "false"}
                  />
                </ListItemIcon>
                <ListItemText primary="None" />
              </ListItemButton>

              {/* SourceToConcepts => cascade=source_to_concepts */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "sourcetoconcepts")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "sourcetoconcepts"}
                  />
                </ListItemIcon>
                <ListItemText primary="Source to Concepts" />
              </ListItemButton>

              {/* SourceMappings => cascade=source_mappings */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "sourcemappings")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "sourcemappings"}
                  />
                </ListItemIcon>
                <ListItemText primary="Source Mappings" />
              </ListItemButton>
            </ul>
          </li>

          <Divider sx={{ marginTop: "8px" }} />

          {/* Inclusion */}
          <li>
            <ul style={{ paddingLeft: 0 }}>
              <ListSubheader
                sx={{
                  bgcolor: "background.paper",
                  position: "sticky",
                  top: 0,
                  paddingLeft: "12px",
                  lineHeight: "32px"
                }}
              >
                Inclusion Type
              </ListSubheader>

              <ListItemButton sx={{ padding: 0 }} onClick={toggleNullableTrue("include", !filters.include)}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.include === true}
                  />
                </ListItemIcon>
                <ListItemText primary="Include" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={toggleNullableTrue("exclude", !filters.exclude)}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.exclude === true}
                  />
                </ListItemIcon>
                <ListItemText primary="Exclude" />
              </ListItemButton>
            </ul>
          </li>
        </List>
      </div>
    </Box>
  );
};

export default ReferenceFilters;
