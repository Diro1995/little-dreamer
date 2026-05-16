import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { subDays, format } from 'date-fns';
import { Colors } from '@/constants/theme';
import { LogEntry } from '@/constants/types';

interface SleepChartProps {
  entries: LogEntry[];
  days: number;
}

export function SleepChart({ entries, days }: SleepChartProps) {
  const [chartWidth, setChartWidth] = useState(300);
  const height = 160;
  const labelH = 20;
  const plotH = height - labelH;

  const data = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayStr = format(date, 'yyyy-MM-dd');
    const daySleeps = entries.filter(
      (e) => e.type === 'sleep' && format(e.startTime, 'yyyy-MM-dd') === dayStr && e.durationMinutes
    );
    const napMins = daySleeps
      .filter((e) => { const h = e.startTime.getHours(); return h >= 7 && h < 19; })
      .reduce((s, e) => s + (e.durationMinutes ?? 0), 0);
    const nightMins = daySleeps
      .filter((e) => { const h = e.startTime.getHours(); return h >= 19 || h < 7; })
      .reduce((s, e) => s + (e.durationMinutes ?? 0), 0);
    return {
      label: days <= 7 ? format(date, 'EEE') : format(date, 'd'),
      napH: napMins / 60,
      nightH: nightMins / 60,
    };
  });

  const maxH = Math.max(14, ...data.map((d) => d.napH + d.nightH));
  const slot = chartWidth / days;
  const barW = Math.max(4, slot * 0.55);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ color: Colors.moonrise, fontSize: 16, fontFamily: 'PlayfairDisplay_400Regular' }}>
          Sleep
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: Colors.sleepGlow }} />
            <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_400Regular' }}>Night</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${Colors.sleepGlow}55` }} />
            <Text style={{ color: Colors.starlight, fontSize: 11, fontFamily: 'DMSans_400Regular' }}>Naps</Text>
          </View>
        </View>
      </View>
      <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <Svg width={chartWidth} height={height}>
          {data.map((d, i) => {
            const x = i * slot + (slot - barW) / 2;
            const nightPx = (d.nightH / maxH) * plotH;
            const napPx = (d.napH / maxH) * plotH;
            const hasData = nightPx + napPx > 0;
            return (
              <G key={i}>
                {hasData ? (
                  <>
                    <Rect
                      x={x}
                      y={plotH - nightPx}
                      width={barW}
                      height={nightPx}
                      rx={3}
                      fill={Colors.sleepGlow}
                    />
                    {napPx > 0 && (
                      <Rect
                        x={x}
                        y={plotH - nightPx - napPx}
                        width={barW}
                        height={napPx}
                        rx={3}
                        fill={`${Colors.sleepGlow}55`}
                      />
                    )}
                  </>
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
