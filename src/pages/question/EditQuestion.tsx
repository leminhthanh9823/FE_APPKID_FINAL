import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import usePutItemJson from '@/hooks/usePutItemJson';
import useFetchItem from '@/hooks/useFetchItem';
import { ENDPOINT } from '@/routers/endpoint';
import { IGetEditQuestionResponse } from '@/diagram/response/getEditQuestion.response';
import {
  LEVEL_DIFFICULT_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  STATUS_UC_OPTIONS,
} from '@/utils/constants/options';
import SingleChoiceOptions from './type-question-component/SingleChoiceOptions';
import { IGetOptionsInQuestionResponse } from '@/diagram/response/getOptionsInQuestion.response';
import MultipleChoiceOptions from './type-question-component/MultipleChoiceOptions';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { ROUTES } from '@/routers/routes';
import { buildRoute } from '@/utils/helper/routeHelper';
import useDeleteItem from '@/hooks/useDeleteItem';

interface QuestionTypeValidator {
  validate: (options: IGetOptionsInQuestionResponse[]) => boolean;
}

const EditQuestion: React.FC = () => {
  const { kid_reading_id, id: questionId } = useParams<{
    kid_reading_id: string;
    id: string;
  }>();
  const { data } = useFetchItem(`${ENDPOINT.QUESTIONS}/cms/get-by-id`, {
    id: questionId,
  });
  const { data: isPracticedData } = useFetchItem(
    `${ENDPOINT.QUESTIONS}/cms/check-is-practiced`,
    { id: questionId }
  );
  const [reqEdit, setReqEdit] = useState<IGetEditQuestionResponse | null>(null);
  const [isPracticed, setIsPracticed] = useState<boolean>(false);
  const { saveChanges } = usePutItemJson(
    `${ENDPOINT.QUESTIONS}/cms/update-question-options`
  );
  const { saveChanges: deleteAction, error: deleteError } = useDeleteItem(
    `${ENDPOINT.QUESTIONS}/cms/${questionId}`
  );

  const [newOptions, setNewOptions] = useState<
    { type: string; options: IGetOptionsInQuestionResponse[] }[]
  >([]);
  const questionValidatorRef = useRef<QuestionTypeValidator | null>(null);

  useEffect(() => {
    if (data) {
      setReqEdit(data);
      setNewOptions([{ type: data.question_type, options: data.options }]);
    }
    if (isPracticedData) {
      setIsPracticed(isPracticedData.isPracticed);
    }
  }, [data, isPracticedData]);

  const handleAddOption = useCallback((questionType: string) => {
    setNewOptions((prevAllOptions) => {
      const currentOptions = prevAllOptions.find(
        (opt) => opt.type === questionType
      );

      const newOption: IGetOptionsInQuestionResponse = {
        id: null,
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
      field: keyof IGetOptionsInQuestionResponse,
      value: any
    ) => {
      setNewOptions((prevAllOptions) => {
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
      setNewOptions((prevAllOptions) => {
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

  const validateForm = (): boolean => {
    if (!reqEdit?.question.trim()) {
      toast.error('Question cannot be empty.');
      return false;
    }
    if (!reqEdit?.question_level_id) {
      toast.error('Please select a question level.');
      return false;
    }
    if (!reqEdit?.question_type) {
      toast.error('Please select a question type.');
      return false;
    }

    if (!isPracticed) {
      let currentType = reqEdit.question_type;
      let currentOptionsEntry = newOptions.find(
        (opt) => opt.type === currentType
      );
      let currentOptions = currentOptionsEntry?.options || [];

      if (questionValidatorRef.current) {
        return questionValidatorRef.current.validate(currentOptions);
      }
    }
    return true;
  };

  const handleInputChange = (name: string, value: any) => {
    setReqEdit((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!reqEdit) {
      toast.error('No data to save.');
      return;
    }
    let payload;
    if (!isPracticed) {
      let currentQuestionType = reqEdit.question_type;
      let optionsForCurrentType =
        newOptions.find((opt) => opt.type === currentQuestionType)?.options ||
        [];
      payload = {
        ...reqEdit,
        options: optionsForCurrentType.map((opt) => ({
          ...opt,
          isCorrect: opt.isCorrect ? 1 : 0,
        })),
      };
    } else {
      payload = {
        question_level_id: reqEdit.question_level_id,
        is_active: reqEdit.is_active,
      };
    }

    let isSuccess = false;
    isSuccess = await saveChanges(payload);
    if (isSuccess) {
      toast.success('Updated successfully.');
    } else {
      toast.error(MESSAGE.UPDATE_FAIL);
      return;
    }
  };

  const handleDelete = async () => {
    if (isPracticed) {
      toast.error('Cannot delete a question that has been practiced.');
      return;
    }
    await deleteAction();
    if (deleteError) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted successfully.');
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
          <h1>Edit question</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
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
              <li className="breadcrumb-item active">Edit question</li>
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
              disabled={isPracticed}
              className="form-control"
              value={reqEdit?.question || ''}
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
              value={reqEdit?.question_level_id || ''}
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

          <div key={'status'} className={`col-12 mb-3`}>
            <label className="form-label">
              {'Status'}
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <select
              className="form-select"
              value={Number(reqEdit?.is_active) || 0}
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
              value={reqEdit?.question_type || ''}
              onChange={(e) =>
                handleInputChange('question_type', e.target.value)
              }
              disabled={isPracticed}
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <option value={option.value} key={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {reqEdit?.question_type === 'Single Choice' && (
            <SingleChoiceOptions
              disabled={isPracticed}
              options={
                newOptions.find((opt) => opt.type === 'Single Choice')
                  ?.options || []
              }
              onOptionChange={handleOptionChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              ref={questionValidatorRef}
            />
          )}

          {reqEdit?.question_type === 'Multiple Choice' && (
            <MultipleChoiceOptions
              disabled={isPracticed}
              options={
                newOptions.find((opt) => opt.type === 'Multiple Choice')
                  ?.options || []
              }
              onOptionChange={handleOptionChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              ref={questionValidatorRef}
            />
          )}

          <div className="d-flex justify-content-end gap-4">
            {!isPracticed && (
              <button
                type="button"
                className="btn btn-danger col-2"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary col-2"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default EditQuestion;
