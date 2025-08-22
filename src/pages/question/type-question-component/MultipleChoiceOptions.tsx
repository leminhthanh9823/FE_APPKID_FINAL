import React, { useImperativeHandle, forwardRef } from "react";
import { IGetOptionsInQuestionResponse } from "@/diagram/response/getOptionsInQuestion.response";
import { toast } from "react-toastify";

const questionType = "Multiple Choice";

interface MultipleChoiceOptionsProps {
  disabled?: boolean | false;
  options: IGetOptionsInQuestionResponse[];
  onOptionChange: (type: string, index: number, field: keyof IGetOptionsInQuestionResponse, value: any) => void;
  onAddOption: (type: string) => void;
  onRemoveOption: (type: string, index: number) => void;
}

const MultipleChoiceOptions = forwardRef<any, MultipleChoiceOptionsProps>(({
  disabled,
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}, ref) => {

  const validateMultiChoiceOptions = (currentOptions: IGetOptionsInQuestionResponse[]): boolean => {
    if (currentOptions.length < 2) {
      toast.error("Multiple Choice questions require at least two options.");
      return false;
    }

    let isHasEmptyOption = false;
    for (const option of currentOptions) {
      if (!option.option.trim()) {
        isHasEmptyOption = true;
        break;
      }
    }
    if (isHasEmptyOption) {
      toast.error("Option text cannot be empty in Multiple Choice.");
      return false;
    }

    const correctOptions = currentOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      toast.error("Please select at least one correct option for Multiple Choice.");
      return false;
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    validate: validateMultiChoiceOptions,
  }));

  return (
    <div className="card">
      <h5 className="card-title">Options for Multiple Choice</h5>
      <div className="card-body">
        {options.map((option, index) => (
          <div key={index} className="input-group mb-3">
            <div className="input-group-text">
              <input
                disabled={disabled}
                className="form-check-input mt-0"
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) => onOptionChange(questionType, index, "isCorrect", e.target.checked)}
                aria-label="Checkbox for following text input"
              />
            </div>
            <input
              disabled={disabled}
              type="text"
              className="form-control"
              placeholder={`Option ${index + 1}`}
              value={option.option}
              onChange={(e) => onOptionChange(questionType, index, "option", e.target.value)}
            />
            <button
              disabled={disabled}
              className="btn btn-outline-danger"
              type="button"
              onClick={() => onRemoveOption(questionType, index)}
            >
              <i className="bi bi-trash font-size-18"></i>
            </button>
          </div>
        ))}
        <button 
          className="btn btn-primary mt-3" 
          onClick={() => onAddOption(questionType)} 
          disabled={disabled}
        >
          <i className="bi bi-plus me-2"></i> Add Option
        </button>
      </div>
    </div>
  );
});

export default MultipleChoiceOptions;