import { useState } from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { FileCheck, FileX, Menu, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import CertificateSectionPanel from '@components/certificate-section-panel';
import CertificateDropzone from '@components/certificate-dropzone';

import {
  section_titles,
  generateInputSections,
  SectionTitleType,
  InputOrUncontrolledComponentProps,
} from '@const/grad-certificate-inputs';
import { parseCertificate } from '@utils/parser/grade/certificate-parser';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Card, CardContent } from '@components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Separator } from '@components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { Checkbox } from '@components/ui/checkbox';
import { Combobox } from '@components/ui/combobox';
import { MultiSelect } from '@components/ui/multi-select';

const getDefaultOrSavedValue = () =>
({
  OU: {
    summer_session: {
      subjects: [],
    },
  },
} as unknown as Record<string, any>);

export default function CertificateBuilder() {
  // form management
  const methods = useForm({
    defaultValues: getDefaultOrSavedValue(),
  });

  // section panel tabs & drawer
  // We manage activeTab via state, effectively "controlled tabs" manually implemented
  const [activeTab, setActiveTab] = useState<SectionTitleType>(section_titles[0]);
  const [isUpperThan2021, setIsUpperThan2021] = useState<string | null>(null);

  const onSubmit = (data: any) => console.log(data);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} autoComplete="off">
        <div className="container mx-auto max-w-[1100px] mb-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 justify-center">

            {/* Left Column: Title & Dropzone */}
            <div className="md:col-span-3 lg:col-span-3">
              <div className="mt-10 mb-6">
                <h3 className="text-xl font-semibold">
                  졸업 이수요건 확인서 생성기 🪄
                </h3>
                <Separator className="mt-4" />
              </div>

              <div className="mb-6">
                <CertificateDropzone
                  onDrop={(file) => {
                    parseCertificate(file[0] as File, methods);
                    const studentNum = methods.getValues('USER.studentNumber');
                    if (studentNum && studentNum.length >= 4) {
                      setIsUpperThan2021(
                        parseInt(studentNum.substring(0, 4), 10) >= 2021
                          ? '2021~'
                          : '~2020'
                      );
                    }
                  }}
                />
              </div>

              {/* Desktop: Sidebar Menu */}
              <div className="hidden xl:block">
                <CertificateSectionPanel activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>

            {/* Right Column: Form Inputs */}
            <div className="md:col-span-3 lg:col-span-3 xl:col-span-auto">
              <Card className="border p-4 md:p-6 w-full">
                <CardContent className="p-0 flex flex-col gap-4">
                  <div className="flex justify-between items-center py-4">
                    <h2 className="text-xl font-semibold text-left">
                      {activeTab}
                    </h2>
                    <div className="w-[200px]">
                      <Label className="text-xs text-muted-foreground mb-1 block">학번</Label>
                      <Select
                        value={isUpperThan2021 || ""}
                        onValueChange={setIsUpperThan2021}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="학번 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2021~">2021년도 이후 (2021 ~ )</SelectItem>
                          <SelectItem value="~2020">2021년도 이전 ( ~ 2020)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />

                  <div className="flex flex-col gap-4">
                    {generateInputSections(methods).map((section) => (
                      <SectionPanelWithInputs
                        key={section.title}
                        inputs={section.inputs}
                        title={section.title}
                        label={section.section_label}
                        isActive={activeTab === section.section_label}
                        laterThan2021={isLaterThan2021(isUpperThan2021 ?? '2021')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Bottom Bar (visible on < xl) */}
              <div className="xl:hidden fixed bottom-10 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div className="pointer-events-auto bg-white dark:bg-slate-900 border rounded-full shadow-lg p-2 flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10">
                          <FileCheck className="h-5 w-5 text-green-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>변경사항 저장</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10">
                          <FileX className="h-5 w-5 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>변경사항 폐기</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                      className="rounded-full bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                      onClick={() => console.log(methods.getValues())}
                    >
                      PDF 생성하기
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="icon" variant="ghost" className="rounded-full h-10 w-10">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto rounded-t-xl">
                        <CertificateSectionPanel
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                        />
                      </SheetContent>
                    </Sheet>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SectionPanelWithInputs({
  inputs,
  title,
  label,
  isActive,
  laterThan2021,
}: {
  inputs: Array<InputOrUncontrolledComponentProps>;
  label: SectionTitleType;
  title: string;
  isActive: boolean;
  laterThan2021: boolean;
}) {
  const { control, watch, setValue, register, getValues } = useFormContext();

  // Unlike Mantine Tabs, we just hide/show content based on active state.
  if (!isActive) return null;

  const content = inputs
    .filter((item) => item.laterThan2021 === undefined || item.laterThan2021 === laterThan2021)
    .map((item, index) => {
      // Wrapper for spacing
      const wrapperClass = isBulkCreditSection(label) ? "col-span-1" : "col-span-1 sm:col-span-1 md:col-span-1 border-b pb-4 mb-4 md:border-none md:pb-0 md:mb-0";
      const key = item.rhf_name ?? `${title}-${index}`;

      if (item.component === 'divider') {
        return (
          <div key={key} className="col-span-1 md:col-span-2 my-4">
            <div className="border-t border-dashed border-red-300 relative flex justify-center">
              <span className="bg-background px-2 text-xs text-red-500 absolute -top-2.5">
                {item.props?.label}
              </span>
            </div>
          </div>
        );
      }

      if (item.component === 'title') {
        return (
          <div key={key} className="col-span-1 md:col-span-2 mt-4">
            <p className="font-semibold text-sm">{item.props?.children}</p>
          </div>
        );
      }

      // Input Render Helper
      const renderInput = () => {
        const commonProps = {
          placeholder: item.placeholder,
          readOnly: item.props?.readOnly,
          className: item.props?.readOnly ? "bg-muted" : "",
        }

        if (item.component === 'month') {
          return (
            <Input
              type="month"
              {...register(item.rhf_name!)}
              {...commonProps}
            />
          )
        }

        const normalizeOptions = (data: any[] = []) => {
          return data.map(opt => {
            if (typeof opt === 'string') return { label: opt, value: opt };
            return opt;
          });
        }

        if (item.component === 'select') {
          return (
            <Controller
              control={control}
              name={item.rhf_name!}
              render={({ field }) => (
                <Combobox
                  options={normalizeOptions(item.props?.data)}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  placeholder={item.placeholder}
                // searchable={item.props?.searchable} // Not supported in ComboboxProps interface yet
                // creatable={item.props?.creatable} // Not supported
                />
              )}
            />
          )
        }

        if (item.component === 'multi-select') {
          return (
            <Controller
              control={control}
              name={item.rhf_name!}
              render={({ field }) => (
                <MultiSelect
                  options={normalizeOptions(item.props?.data)}
                  selected={field.value || []}
                  onChange={(val) => field.onChange(val)}
                  placeholder={item.placeholder}
                // searchable={item.props?.searchable}
                // creatable={item.props?.creatable}
                // getCreateLabel={item.props?.getCreateLabel}
                // onCreate={item.props?.onCreate}
                />
              )}
            />
          )
        }

        if (item.component === 'number') {
          return (
            <Input
              type="number"
              {...register(item.rhf_name!, { valueAsNumber: true })}
              {...commonProps}
              min={item.props?.min}
              max={item.props?.max}
              onChange={(e) => {
                const val = Number(e.target.value);
                setValue(item.rhf_name!, val);
                if (item.props?.onChange) {
                  item.props.onChange(val);
                }
              }}
            />
          )
        }

        // Default text
        return (
          <Input
            type={item.type || 'text'}
            {...register(item.rhf_name!)}
            {...commonProps}
            {...item.props} // Pass misc props like pattern, maxLength
          />
        )
      }

      return (
        <div key={key} className={wrapperClass}>
          <div className="flex flex-col gap-2">
            {item.label && <Label htmlFor={item.rhf_name} className="mb-1">{item.label}</Label>}
            {renderInput()}
          </div>
        </div>
      );
    });

  return (
    <div className={cn("grid gap-4", isBulkCreditSection(label) ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2")}>
      {content}
    </div>
  );
}

const isBulkCreditSection = (section: SectionTitleType) =>
  section !== '신청자 정보' && section !== '기타 학점';

const isLaterThan2021 = (year: string) => year === '2021~';

