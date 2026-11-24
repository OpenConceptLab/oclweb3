import React from "react";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import GAService from "../../services/GAService";
import Dialog from "../common/Dialog";
import DialogTitle from "../common/DialogTitle";
import { LockTooltip } from "../common/NoticeLocks";

// `lock` is the reason the expansion's version notices lock its rebuild (NoticeLocks): Rebuild is disabled and says
// why, while Create Similar, which can write to another version, stays open. While those notices are `pending`,
// Rebuild waits for them.

const RebuildExpansionDialog = ({
  expansion,
  onClose,
  onCreateSimilar,
  onRebuild,
  rebuilding,
  lock,
  pending
}) => {
  const { t } = useTranslation();
  if (!expansion) return null;

  return (
    <Dialog open={Boolean(expansion)} onClose={onClose}>
      <DialogTitle>{t("repo.rebuild_expansion")}</DialogTitle>
      <DialogContent sx={{ padding: "16px 0 0 0 !important" }}>
        {t("repo.rebuild_expansion_message")}
        <br />
        <br />
        {t("repo.rebuild_expansion_compare_message")}
      </DialogContent>
      <DialogActions sx={{ padding: "24px 0 0 0" }}>
        <MuiButton
          variant="contained"
          sx={{ textTransform: "none" }}
          disabled={rebuilding}
          onClick={() => {
            GAService.recordActionEvent("Expansion", "create_similar_expansion", expansion.mnemonic || expansion.url, { expansion: expansion.url });
            onCreateSimilar(expansion);
          }}
        >
          {t("repo.create_similar")}
        </MuiButton>
        <LockTooltip title={lock} placement="top" display="inline-block">
          <MuiButton
            color="error"
            variant="contained"
            sx={{ textTransform: "none" }}
            disabled={rebuilding || pending || Boolean(lock)}
            startIcon={rebuilding ? <CircularProgress size={16} color="inherit" /> : undefined}
            endIcon={lock ? <LockIcon fontSize="inherit" /> : undefined}
            onClick={() => !lock && !pending && onRebuild(expansion)}
          >
            {rebuilding ? t("repo.rebuilding") : t("repo.rebuild")}
          </MuiButton>
        </LockTooltip>
        <MuiButton
          variant="outlined"
          sx={{ textTransform: "none" }}
          onClick={onClose}
        >
          {t("common.cancel")}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default RebuildExpansionDialog;
