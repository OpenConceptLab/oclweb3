import React from "react";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Button as MuiButton } from "@mui/material";
import { useTranslation } from "react-i18next";

import Dialog from "../common/Dialog";
import DialogTitle from "../common/DialogTitle";

const RebuildExpansionDialog = ({
  expansion,
  onClose,
  onCreateSimilar,
  onRebuild
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
          onClick={() => onCreateSimilar(expansion)}
        >
          {t("repo.create_similar")}
        </MuiButton>
        <MuiButton
          color="error"
          variant="contained"
          sx={{ textTransform: "none" }}
          onClick={() => onRebuild(expansion)}
        >
          {t("repo.rebuild")}
        </MuiButton>
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
