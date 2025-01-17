import React, { useState, useEffect } from "react";
import { Box, TextField, Grid } from "@mui/material";
import { tab } from "@testing-library/user-event/dist/tab";

export default function InsuredAcres({ id, tabState, setTabState }) {
  const [localAcres, setLocalAcres] = useState(tabState.acres);
  const [localAcresError, setLocalAcresError] = useState(tabState.acresError);

  // Synchronize local state with global state when the component mounts or the global state changes
  useEffect(() => {
    setLocalAcres(tabState.acres);
    setLocalAcresError(tabState.acresError);
  }, [tabState.acres, tabState.acresError]);

  function isInvalidNumber(value, max, symbol = "%") {
    if (value && value.includes(".")) {
      return { hasError: true, errorMessage: "No Decimals" };
    }

    if (value && parseInt(value, 10) > max) {
      return { hasError: true, errorMessage: `Max 200,000` };
    }

    if (!value) {
      return { hasError: true, errorMessage: "Required" };
    }

    return { hasError: false, errorMessage: "" };
  }

  const handleAcresChange = (event) => {
    setLocalAcres(event.target.value);
    setLocalAcresError(isInvalidNumber(event.target.value, 200000, ""));
  };

  const handleBlur = () => {
    setTabState(
      {
        ...tabState,
        acres: localAcres,
        acresError: localAcresError,
      },
      id
    );
  };

  return (
    <TextField
      label="Acres"
      value={localAcres}
      onChange={handleAcresChange}
      onBlur={handleBlur}
      margin="normal"
      InputProps={{
        inputProps: {
          min: 0,
          max: 200000,
          onKeyDown: (event) => {
            if (event.key === "-") {
              event.preventDefault();
            }
          },
        },
      }}
      type="number"
      InputLabelProps={{
        shrink: true,
      }}
      style={{ width: "150px", margin: "10px" }}
      error={localAcresError.hasError}
      helperText={localAcresError.errorMessage}
    />
  );
}
