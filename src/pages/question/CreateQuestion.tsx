import { ICreateOptionsInQuestionRequest } from '@/diagram/request/question/createOptionsInQuestion.request';
import { ICreateQuestionRequest } from '@/diagram/request/question/createQuestion.request';
import { ROUTES } from '@/routers/routes';
import {
  LEVEL_DIFFICULT_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  STATUS_UC_OPTIONS,
} from '@/utils/constants/options';
import { buildRoute } from '@/utils/helper/routeHelper';
import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SingleChoiceOptions from './type-question-component/SingleChoiceOptions';
import MultipleChoiceOptions from './type-question-component/MultipleChoiceOptions';
import { toast } from 'react-toastify';
import { MESSAGE } from '@/utils/constants/errorMessage';
import usePostItemJson from '@/hooks/usePostItemJson';
import { ENDPOINT } from '@/routers/endpoint';
import { IGetOptionsInQuestionResponse } from '@/diagram/response/getOptionsInQuestion.response';

interface QuestionTypeValidator {
  validate: (options: ICreateOptionsInQuestionRequest[]) => boolean;
}
const CreateQuestion: React.FC = () => {
  const { kid_reading_id } = useParams<{ kid_reading_id: string }>();
  const [reqQuesCreate, setReqQuesCreate] = useState<ICreateQuestionRequest>({
    kid_reading_id: kid_reading_id ? Number(kid_reading_id) : 0,
    question_level_id: LEVEL_DIFFICULT_OPTIONS[0].value,
    question: '',
    question_type: '',
    is_active: 1,
    options: [],
  });
  const [reqOptionsCreate, setReqOptionsCreate] = useState<
    { type: string; options: ICreateOptionsInQuestionRequest[] }[]
  >([]);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const questionValidatorRef = useRef<QuestionTypeValidator | null>(null);
  const { saveChanges } = usePostItemJson(
    `${ENDPOINT.QUESTIONS}/cms/create-question-options`
  );

  const handleAddOption = useCallback((questionType: string) => {
    setReqOptionsCreate((prevAllOptions) => {
      const currentOptions = prevAllOptions.find(
        (opt) => opt.type === questionType
      );

      const newOption: ICreateOptionsInQuestionRequest = {
        option: '',
        isCorrect: false,
        key_position: currentOptions ? currentOptions.options.length + 1 : 0,
        is_active: true,
      };

      if (!currentOptions) {
        return [
          ...prevAllOptions,
          { type: questionType, options: [newOption] },
        ];
      } else {
        return prevAllOptions.map((typeOption) =>
          typeOption.type === questionType
            ? { ...typeOption, options: [...typeOption.options, newOption] }
            : typeOption
        );
      }
    });
  }, []);

  const handleOptionChange = useCallback(
    (
      questionType: string,
      index: number,
      field: keyof ICreateOptionsInQuestionRequest | keyof IGetOptionsInQuestionResponse,
      value: any
    ) => {
      setReqOptionsCreate((prevAllOptions) => {
        const currentOptions =
          prevAllOptions.find((opt) => opt.type === questionType)?.options ||
          [];
        const updatedOptions = [...currentOptions];
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        return prevAllOptions.map((opt) =>
          opt.type === questionType ? { ...opt, options: updatedOptions } : opt
        );
      });
    },
    []
  );

  const handleRemoveOption = useCallback(
    (questionType: string, index: number) => {
      setReqOptionsCreate((prevAllOptions) => {
        const currentOptions =
          prevAllOptions.find((opt) => opt.type === questionType)?.options ||
          [];

        const updatedOptions = currentOptions
          .filter((_, i) => i !== index)
          .map((opt, idx) => ({ ...opt, key_position: idx + 1 }));
        return prevAllOptions.map((opt) =>
          opt.type === questionType ? { ...opt, options: updatedOptions } : opt
        );
      });
    },
    []
  );

  const handleInputChange = (name: string, value: any) => {
    setReqQuesCreate((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const validateForm = (): boolean => {
    if (!reqQuesCreate?.question.trim()) {
      toast.error('Question cannot be empty.');
      return false;
    }
    if (!reqQuesCreate?.question_level_id) {
      toast.error('Please select a question level.');
      return false;
    }
    if (!reqQuesCreate?.question_type) {
      toast.error('Please select a question type.');
      return false;
    }

    let currentType = reqQuesCreate.question_type;
    let currentOptionsEntry = reqOptionsCreate.find(
      (opt) => opt.type === currentType
    );
    let currentOptions = currentOptionsEntry?.options || [];

    if (questionValidatorRef.current) {
      return questionValidatorRef.current.validate(currentOptions);
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isCreated) {
      toast.error('Question already created.');
      return;
    }
    if (!validateForm()) return;
    if (!reqQuesCreate) {
      toast.error('No data to save.');
      return;
    }
    let payload;
    let currentQuestionType = reqQuesCreate.question_type;
    let optionsForCurrentType =
      reqOptionsCreate.find((opt) => opt.type === currentQuestionType)
        ?.options || [];
    payload = {
      ...reqQuesCreate,
      options: optionsForCurrentType.map((opt) => ({
        ...opt,
        isCorrect: opt.isCorrect ? 1 : 0,
      })),
    };

    let isSuccess = false;
    isSuccess = await saveChanges(payload);
    if (isSuccess) {
      toast.success('Create question successfully.');
      setIsCreated(true);
      setTimeout(() => {
        window.location.href = buildRoute(ROUTES.QUESTIONS, {
          id: kid_reading_id || '',
        });
      }, 2000);
    }
  };

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Questions</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/dashboard">CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.READING}`}>Reading</a>
              </li>
              <li className="breadcrumb-item">
                <a
                  href={`${buildRoute(ROUTES.QUESTIONS, { id: kid_reading_id || '' })}`}
                >
                  Questions
                </a>
              </li>
              <li className="breadcrumb-item active">Create question</li>
            </ol>
          </nav>
        </div>
        <div
          className="row mb-3"
          style={{
            padding: '2%',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 20px #8c98a4',
          }}
        >
          <div key={'question'} className={`col-12 mb-3`}>
            <label className="form-label">
              Question
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <textarea
              className="form-control"
              value={reqQuesCreate?.question || ''}
              onChange={(e) => handleInputChange('question', e.target.value)}
            />
          </div>

          <div key={'level'} className={`col-12 mb-3`}>
            <label className="form-label">
              Question level
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <select
              className="form-select"
              value={reqQuesCreate?.question_level_id || ''}
              onChange={(e) =>
                handleInputChange(
                  'question_level_id',
                  e.target.value != null
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
            >
              {LEVEL_DIFFICULT_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div key={'type'} className={`col-12 mb-3`}>
            <label className="form-label">
              {'Status'}
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <select
              className="form-select"
              value={Number(reqQuesCreate?.is_active) || 0}
              onChange={(e) => handleInputChange('is_active', e.target.value)}
            >
              {STATUS_UC_OPTIONS.map((option) => (
                <option value={Number(option.value) || 0} key={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div key={'type'} className={`col-12 mb-3`}>
            <label className="form-label">
              Question type
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <select
              className="form-select"
              value={reqQuesCreate?.question_type || ''}
              onChange={(e) =>
                handleInputChange('question_type', e.target.value)
              }
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <option value={option.value} key={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {reqQuesCreate?.question_type === 'Single Choice' && (
            <SingleChoiceOptions
              options={
                reqOptionsCreate.find((opt) => opt.type === 'Single Choice')
                  ?.options || []
              }
              onOptionChange={handleOptionChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              ref={questionValidatorRef}
            />
          )}

          {reqQuesCreate?.question_type === 'Multiple Choice' && (
            <MultipleChoiceOptions
              options={
                reqOptionsCreate.find((opt) => opt.type === 'Multiple Choice')
                  ?.options || []
              }
              onOptionChange={handleOptionChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              ref={questionValidatorRef}
            />
          )}

          <div className="d-flex justify-content-end">
            {!isCreated && (
              <button
                type="button"
                className="btn btn-primary col-2"
                onClick={handleSubmit}
              >
                Create
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateQuestion;
