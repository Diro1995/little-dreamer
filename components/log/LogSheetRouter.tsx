import React from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { DiaperLogger } from './DiaperLogger';
import { FeedLogger } from './FeedLogger';
import { SleepLogger } from './SleepLogger';
import { PumpLogger } from './PumpLogger';
import { NoteLogger } from './NoteLogger';
import { TemperatureLogger } from './TemperatureLogger';
import { MedsLogger } from './MedsLogger';
import { JournalLogger } from './JournalLogger';
import { EventType, LogEntry } from '@/constants/types';

interface LogSheetRouterProps {
  type: EventType | null;
  onClose: () => void;
  editEntry?: LogEntry | null;
}

function sheetHeight(type: EventType | null): number {
  if (type === 'sleep') return 80;
  if (type === 'feed_breast' || type === 'feed_bottle' || type === 'feed_solid') return 75;
  if (type === 'diaper') return 55;
  if (type === 'temperature') return 75;
  if (type === 'medicine') return 70;
  if (type === 'journal') return 80;
  return 60;
}

export function LogSheetRouter({ type, onClose, editEntry }: LogSheetRouterProps) {
  const visible = type !== null;

  const renderContent = () => {
    const e = editEntry ?? undefined;
    switch (type) {
      case 'diaper':
        return <DiaperLogger onClose={onClose} editEntry={e} />;
      case 'feed_breast':
        return <FeedLogger onClose={onClose} initialTab="breast" editEntry={e} />;
      case 'feed_bottle':
        return <FeedLogger onClose={onClose} initialTab="bottle" editEntry={e} />;
      case 'feed_solid':
        return <FeedLogger onClose={onClose} initialTab="solid" editEntry={e} />;
      case 'sleep':
        return <SleepLogger onClose={onClose} editEntry={e} />;
      case 'pump':
        return <PumpLogger onClose={onClose} editEntry={e} />;
      case 'note':
      case 'milestone':
        return <NoteLogger type={type} onClose={onClose} />;
      case 'temperature':
        return <TemperatureLogger onClose={onClose} editEntry={e} />;
      case 'medicine':
        return <MedsLogger onClose={onClose} editEntry={e} />;
      case 'journal':
        return <JournalLogger onClose={onClose} editEntry={e} />;
      default:
        return null;
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightPercent={sheetHeight(type)}
      scrollable={type === 'sleep' || type?.startsWith('feed') || type === 'medicine' || type === 'journal'}
    >
      {renderContent()}
    </BottomSheet>
  );
}
