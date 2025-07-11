import { PageMain } from '@app/components/PageMain';
import { ELocalStorageKey } from '@app/core/localStorage/constants';
import SettingsIcon from '@mui/icons-material/Settings';
import { Dialog, DialogContent, DialogTitle, Fab, Stack, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale/ru';
import { FC, useState } from 'react';

enum EWorkState {
  working_in_day = 'working_in_day',
  working_in_night = 'working_in_night',
  not_working_after_night = 'not_working_after_night',
  free_day = 'free_day',
}

const DaysDiffWorkState = new Map([
  [0, EWorkState.working_in_day],
  [1, EWorkState.working_in_night],
  [2, EWorkState.not_working_after_night],
  [3, EWorkState.free_day],
]);

const WorkStateLabel: Record<EWorkState, string> = {
  [EWorkState.working_in_day]: 'Работает в день',
  [EWorkState.working_in_night]: 'Работает в ночь',
  [EWorkState.not_working_after_night]: 'Не работает после ночи',
  [EWorkState.free_day]: 'Свободный день',
};

const WorkStateColor: Record<EWorkState, string> = {
  [EWorkState.working_in_day]: 'red',
  [EWorkState.working_in_night]: 'brown',
  [EWorkState.not_working_after_night]: 'rebeccapurple',
  [EWorkState.free_day]: 'green',
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const getWorkStateFromDate = (date: Date, firstDayOfWorkDate: Date): EWorkState => {
  const fixedDate = new Date(date);
  fixedDate.setHours(0, 0, 0, 0);
  const fixedFirstDayOfWorkDate = new Date(date);
  fixedFirstDayOfWorkDate.setHours(0, 0, 0, 0);
  const diffInDays = (fixedDate.getTime() - firstDayOfWorkDate.getTime()) / DAY_IN_MS;

  const state = DaysDiffWorkState.get(diffInDays % DaysDiffWorkState.size);
  if (!state) throw new Error('State not found');
  return state;
};

export const MainPage: FC = () => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [firstDayOfWork, setFirstDayOfWork] = useState(localStorage.getItem(ELocalStorageKey.FirstDayOfWork));
  const firstDayOfWorkDate = firstDayOfWork ? new Date(firstDayOfWork) : null;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <PageMain>
        <Stack direction="column" gap={2}>
          <Typography variant="h3">Работает ли папа ... ?</Typography>
          {firstDayOfWorkDate && (
            <Stack direction="column" gap={2}>
              <Typography variant="body1" alignItems="center">
                Сегодня:{' '}
                <Typography
                  component="span"
                  sx={{ color: WorkStateColor[getWorkStateFromDate(new Date(), firstDayOfWorkDate)] }}
                >
                  {WorkStateLabel[getWorkStateFromDate(new Date(), firstDayOfWorkDate)]}
                </Typography>
              </Typography>
              <Typography variant="body1">
                Завтра:{' '}
                <Typography
                  component="span"
                  sx={{
                    color: WorkStateColor[getWorkStateFromDate(new Date(Date.now() + DAY_IN_MS), firstDayOfWorkDate)],
                  }}
                >
                  {WorkStateLabel[getWorkStateFromDate(new Date(Date.now() + DAY_IN_MS), firstDayOfWorkDate)]}
                </Typography>
              </Typography>
              <Typography variant="body1">
                Послезавтра:{' '}
                <Typography
                  component="span"
                  sx={{
                    color:
                      WorkStateColor[getWorkStateFromDate(new Date(Date.now() + DAY_IN_MS * 2), firstDayOfWorkDate)],
                  }}
                >
                  {WorkStateLabel[getWorkStateFromDate(new Date(Date.now() + DAY_IN_MS * 2), firstDayOfWorkDate)]}
                </Typography>
              </Typography>
              <Typography variant="body1">В выбранный день:</Typography>
              <DatePicker
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                }}
              />
              {selectedDate && (
                <Typography
                  component="span"
                  sx={{
                    color: WorkStateColor[getWorkStateFromDate(new Date(selectedDate), firstDayOfWorkDate)],
                  }}
                >
                  {WorkStateLabel[getWorkStateFromDate(new Date(selectedDate), firstDayOfWorkDate)]}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>

        <Fab
          size="small"
          color="secondary"
          aria-label="add"
          sx={(t) => ({ position: 'absolute', right: t.spacing(2), bottom: t.spacing(2) })}
          onClick={() => setIsSettingsDialogOpen(true)}
        >
          <SettingsIcon />
        </Fab>
        <Dialog open={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)}>
          <DialogTitle>Настройки</DialogTitle>
          <DialogContent sx={{ paddingTop: (t) => `${t.spacing(2)} !important` }}>
            <Stack direction="column" gap={2}>
              <Typography variant="body1">Когда последний раз работал в день (сегодня или ранее)?</Typography>
              <DatePicker
                label="Последний день работы в день"
                value={firstDayOfWorkDate}
                onChange={(newValue) => {
                  if (newValue) {
                    const newDateString = newValue.toISOString();
                    setFirstDayOfWork(newDateString);
                    localStorage.setItem(ELocalStorageKey.FirstDayOfWork, newDateString);
                  } else {
                    setFirstDayOfWork(null);
                    localStorage.removeItem(ELocalStorageKey.FirstDayOfWork);
                  }
                }}
              />
            </Stack>
          </DialogContent>
        </Dialog>
      </PageMain>
    </LocalizationProvider>
  );
};
