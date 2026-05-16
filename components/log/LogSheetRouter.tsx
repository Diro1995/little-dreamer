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
import { EventType } from '@/constants/types';

interface LogSheetRouterProps {
  type: EventType | null;
  onClose: () => void;
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

export function LogSheetRouter({ type, onClose }: LogSheetRouterProps) {
  const visible = type !== null;

  const renderContent = () => {
    switch (type) {
      case 'diaper':
        return <DiaperLogger onClose={onClose} />;
      case 'feed_breast':
        return <FeedLogger onClose={onClose} initialTab="breast" />;
      case 'feed_bottle':
        return <FeedLogger onClose={onClose} initialTab="bottle" />;
      case 'feed_solid':
        return <FeedLogger onClose={onClose} initialTab="solid" />;
      case 'sleep':
        return <SleepLogger onClose={onClose} />;
      case 'pump':
        return <PumpLogger onClose={onClose} />;
      case 'note':
      case 'milestone':
        return <NoteLogger type={type} onClose={onClose} />;
      case 'temperature':
        return <TemperatureLogger onClose={onClose} />;
      case 'medicine':
        return <MedsLogger onClose={onClose} />;
      case 'journal':
        return <JournalLogger onClose={onClose} />;
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
