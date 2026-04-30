import React from "react";
import {
  Box,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Button as MuiButton
} from "@mui/material";
import { useTranslation } from "react-i18next";

import Dialog from "../common/Dialog";
import DialogTitle from "../common/DialogTitle";

const RepoVersionList = ({ title, versions = [], emptyLabel }) => (
  <Box sx={{ mt: 2 }}>
    <Typography
      sx={{ fontSize: "15px", fontWeight: 700, color: "surface.contrastText" }}
    >
      {title} ({versions.length.toLocaleString()})
    </Typography>
    {versions.length ? (
      <Box component="ul" sx={{ pl: 2.5, mt: 1, mb: 0 }}>
        {versions.map(version => (
          <li
            key={
              version.version_url ||
              `${version.owner}-${version.short_code}-${version.version}`
            }
          >
            <a href={`#${version.version_url}`}>
              {`${version.owner} / ${version.short_code}:${version.version}`}
            </a>
          </li>
        ))}
      </Box>
    ) : (
      <Typography sx={{ mt: 1, fontSize: "13px", color: "secondary.main" }}>
        {emptyLabel}
      </Typography>
    )}
  </Box>
);

const ExpansionDetailsDialog = ({ expansion, onClose }) => {
  const { t } = useTranslation();
  if (!expansion) return null;

  const explicitRepoVersions = [
    ...(expansion?.explicit_source_versions || []),
    ...(expansion?.explicit_collection_versions || [])
  ];
  const evaluatedRepoVersions = [
    ...(expansion?.evaluated_source_versions || []),
    ...(expansion?.evaluated_collection_versions || [])
  ];

  return (
    <Dialog open={Boolean(expansion)} onClose={onClose}>
      <DialogTitle>
        {t("repo.expansion_details_title", { mnemonic: expansion.mnemonic })}
      </DialogTitle>
      <DialogContent sx={{ padding: "16px 0 0 0 !important" }}>
        <Typography
          sx={{
            fontSize: "15px",
            fontWeight: 700,
            color: "surface.contrastText"
          }}
        >
          {t("repo.version.expansion_form.parameters")}
        </Typography>
        <Box
          component="pre"
          sx={{
            mt: 1,
            mb: 2,
            p: 1.5,
            borderRadius: "8px",
            backgroundColor: "surface.main",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}
        >
          {JSON.stringify(expansion.parameters || {}, null, 2)}
        </Box>

        <Divider />

        <RepoVersionList
          title={t("repo.explicit_repo_versions")}
          versions={explicitRepoVersions}
          emptyLabel={t("common.none")}
        />
        <RepoVersionList
          title={t("repo.evaluated_repo_versions")}
          versions={evaluatedRepoVersions}
          emptyLabel={t("common.none")}
        />
      </DialogContent>
      <DialogActions sx={{ padding: "24px 0 0 0" }}>
        <MuiButton
          variant="outlined"
          sx={{ textTransform: "none" }}
          onClick={onClose}
        >
          {t("common.close")}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default ExpansionDetailsDialog;
