import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { subDays, format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { LogEntry } from '@/constants/types';

interface FeedChartProps {
  entries: LogEntry[];
  days: number;
}

export function FeedChart({ entries, days }: FeedChartProps) {
  const [chartWidth, setChartWidth] = useState(300);
  const height = 140;
  const labelH = 20;
  const plotH = height - labelH;

  const data = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayStr = format(date, 'yyyy-MM-dd');
    const count = entries.filter(
      (e) =>
        (e.type === 'feed_breast' || e.type === 'feed_bottle' || e.type === 'feed_solid') &&
        format(e.startTime, 'yyyy-MM-dd') === dayStr
    ).length;
    return { label: days <= 7 ? format(date, 'EEE') : format(date, 'd'), count };
  });

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const slot = chartWidth / days;
  const barW = Math.max(4, slot * 0.55);

  return (
    <View>
      <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular', marginBottom: 10 }}>
        Feeds
      </Text>
      <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <Svg width={chartWidth} height={height}>
          {data.map((d, i) => {
            const x = i * slot + (slot - barW) / 2;
            const barPx = (d.count / maxCount) * plotH;
            return (
              <G key={i}>
                {d.count > 0 ? (
                  <Rect
                    x={x}
                    y={plotH - barPx}
                    width={barW}
                    height={barPx}
                    rx={3}
                    fill={Colors.feedGlow}
                    opacity={0.85}
                  />
                ) : (
                  <Rect x={x} y={plotH - 3} width={barW} height={3} rx={1} fill={Colors.border} />
                )}
                <SvgText
                  x={x + barW / 2}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize={days > 14 ? 9 : 10}
                  fill={Colors.starlight}
                >
                  {d.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
