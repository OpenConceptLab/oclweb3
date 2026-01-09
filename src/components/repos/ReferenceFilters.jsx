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
import pickBy from 'lodash/pickBy'

const DEFAULT_FILTERS = {
  versioning: "", // unversioned | repository | resource
  repo_version: "", // version
  cascade: "", // any | none | source_to_concepts | source_mappings
  definition_type: "", // intensional | extensional
  inclusion_type: "", // include | exclude
};

const ReferenceFilters = ({ onChange, heightToSubtract }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);

  const toggleGroupValue = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? "" : value
    }));
  };

  const onApply = () => {
    onChange?.({...pickBy(filters, value => value)});
  };

  const onClear = () => {
    setFilters(DEFAULT_FILTERS);
    onChange?.({});
  };

  const count = React.useMemo(() => {
    let c = 0;
    if (filters.versioning) c += 1;
    if (filters.repo_version) c += 1;
    if (filters.cascade) c += 1;
    if (filters.definition_type) c += 1;
    if (filters.inclusion_type) c += 1;
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
                Reference Versioning
              </ListSubheader>

              {/* Resource Versioned: true/false */}
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("versioning", "unversioned")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.versioning === "unversioned"}
                  />
                </ListItemIcon>
                <ListItemText primary="Unversioned" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("versioning", "repository")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.versioning === "repository"}
                  />
                </ListItemIcon>
                <ListItemText primary="Repository" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("versioning", "resource")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.versioning === "resource"}
                  />
                </ListItemIcon>
                <ListItemText primary="Resource" />
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
                Definition Type
              </ListSubheader>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("definition_type", "intensional")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.definition_type === "intensional"}
                  />
                </ListItemIcon>
                <ListItemText primary="Intensional / Rule-based" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("definition_type", "extensional")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.definition_type === "extensional"}
                  />
                </ListItemIcon>
                <ListItemText primary="Extensional / Enumerated" />
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
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "any")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "any"}
                  />
                </ListItemIcon>
                <ListItemText primary="Any" />
              </ListItemButton>
              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("cascade", "none")}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.cascade === "none"}
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

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("inclusion_type", 'include')}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.inclusion_type === 'include'}
                  />
                </ListItemIcon>
                <ListItemText primary="Include" />
              </ListItemButton>

              <ListItemButton sx={{ padding: 0 }} onClick={() => toggleGroupValue("inclusion_type", 'exclude')}>
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  <Checkbox
                    sx={{ padding: "0 8px" }}
                    size="small"
                    checked={filters.inclusion_type === 'exclude'}
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
