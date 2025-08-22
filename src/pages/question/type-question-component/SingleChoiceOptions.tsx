import React, { useImperativeHandle, forwardRef } from "react";
import { IGetOptionsInQuestionResponse } from "@/diagram/response/getOptionsInQuestion.response";
import { toast } from "react-toastify";
import { ICreateOptionsInQuestionRequest } from "@/diagram/request/question/createOptionsInQuestion.request";

const questionType = "Single Choice";

interface SingleChoiceOptionsProps {
  disabled?: boolean | false;
  options: IGetOptionsInQuestionResponse[];
  onOptionChange: (type: string, index: number, field: keyof IGetOptionsInQuestionResponse | keyof ICreateOptionsInQuestionRequest, value: any) => void;
  onAddOption: (type: string) => void;
  onRemoveOption: (type: string, index: number) => void;
}

const SingleChoiceOptions = forwardRef<any, SingleChoiceOptionsProps>(({
  disabled,
  options,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}, ref) => {
  
  const handleRadioChange = (selectedIndex: number) => {
    if (!onOptionChange) return;
    const updatedOptions = options.map((option, idx) => ({
      ...option,
      isCorrect: idx === selectedIndex,
    }));
    updatedOptions.forEach((option, idx) => {
      onOptionChange(questionType, idx, "isCorrect", option.isCorrect);
    });
  };

  const validateSingleChoiceOptions = (currentOptions: IGetOptionsInQuestionResponse[] | ICreateOptionsInQuestionRequest[]): boolean => {
    if (disabled) {
      return true;
    }
    if (currentOptions.length < 2) {
      toast.error("Single Choice questions require at least two options.");
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
      toast.error("Option text cannot be empty in Single Choice.");
      return false;
    }

    const correctOptions = currentOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      toast.error("Please select one correct option for Single Choice.");
      return false;
    }
    if (correctOptions.length > 1) {
      toast.error("Single Choice questions can only have one correct answer.");
      return false;
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    validate: validateSingleChoiceOptions,
  }));

  return (
    <div className="card">
      <h5 className="card-title">Options for Single Choice</h5>
      <div className="card-body">
        {options.map((option, index) => (
          <div key={index} className="input-group mb-3">
            <div className="input-group-text">
              <input
                disabled={disabled}
                className="form-check-input mt-0"
                type="radio"
                name="single-choice-option" 
                checked={option.isCorrect}
                onChange={() => handleRadioChange(index)}
                aria-label="Radio button for following text input"
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
          <i className="bi bi-plus me-2"></i>  Add Option
        </button>
      </div>
    </div>
  );
});

export default SingleChoiceOptions;