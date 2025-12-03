"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/components/Map/DateRangePicker/DateRangePicker.module.scss";

interface DateRangePickerProps {
  dateRange: [Date | null, Date | null];
  onChange: (update: [Date | null, Date | null]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onChange,
}) => {
  return (
    <div className={styles.datePickerWrapper}>
      <DatePicker
        selectsRange
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={onChange}
        placeholderText="Select date range"
        dateFormat="yyyy-MM-dd"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        minDate={new Date(2000, 0, 1)}
        maxDate={new Date()}
        className={styles.datePickerInput}
      />
    </div>
  );
};

export default DateRangePicker;
