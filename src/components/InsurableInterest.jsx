import React, { useState, useEffect } from "react";
import { Box, TextField, Grid, InputAdornment } from "@mui/material";

export default function InsurableInterest({ id, tabState, setTabState }) {
  const [localInterest, setLocalInterest] = useState(tabState.interest);
  const [localInterestError, setLocalInterestError] = useState(tabState.interestError);

  // Synchronize local state with global state when the component mounts or the global state changes
  useEffect(() => {
    setLocalInterest(tabState.interest);
    setLocalInterestError(tabState.interestError);
  }, [tabState.interest, tabState.interestError]);

  function isInvalidNumber(value, max, symbol = "%") {
    if (value.includes(".")) {
      return { hasError: true, errorMessage: "No Decimals" };
    }

    if (parseInt(value, 10) > max) {
      return { hasError: true, errorMessage: `Max ${max}${symbol}` };
    }

    if (!value) {
      return { hasError: true, errorMessage: "Required" };
    }

    return { hasError: false, errorMessage: "" };
  }

  const handleBlur = () => {
    setTabState(
      {
        ...tabState,
        interest: localInterest,
        interestError: localInterestError,
      },
      id
    );
  };

  const handleInterestChange = (event) => {
    setLocalInterest(event.target.value);
    setLocalInterestError(isInvalidNumber(event.target.value, 100));
  };

  return (
    <TextField
      label="Insurable Interest"
      value={localInterest}
      onChange={handleInterestChange}
      onBlur={handleBlur}
      InputProps={{
        endAdornment: <InputAdornment position="end">%</InputAdornment>,
        inputProps: {
          min: 0,
          max: 100,
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
      error={localInterestError.hasError}
      helperText={localInterestError.errorMessage}
    />
  );
}
