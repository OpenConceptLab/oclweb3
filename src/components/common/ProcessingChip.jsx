import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import { useTranslation } from "react-i18next";

const ProcessingChip = ({
  processed = false,
  fading = false,
  fadeDurationMs = 60000,
  sx,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <Chip
      size="small"
      variant="outlined"
      color={processed ? "success" : "warning"}
      icon={
        processed ? (
          <CheckCircleOutlineIcon fontSize="inherit" />
        ) : (
          <SyncOutlinedIcon fontSize="inherit" />
        )
      }
      label={processed ? t("common.processed") : t("common.processing")}
      sx={[fading ? {
        opacity: 0
      } : {
        opacity: 1
      }, fading ? {
        transition: `opacity ${fadeDurationMs}ms linear`
      } : {
        transition: null
      }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    />
  );
};

export default ProcessingChip;
