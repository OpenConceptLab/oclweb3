import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
      sx={[
        {
          opacity: fading ? 0 : 1,
          transition: fading ? `opacity ${fadeDurationMs}ms linear` : undefined
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
      ]}
      {...rest}
    />
  );
};

export default ProcessingChip;
