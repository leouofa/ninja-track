import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ChartDataPoint } from '../utils/reportsUtils';
import { createTextStyle, useTheme } from '../utils/theme';

interface StackedBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  showValues?: boolean;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  height = 300,
  showValues = false
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme, height);
  
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No data to display</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (theme.spacing.container * 2);

  // Calculate max value for proper y-axis scaling
  const maxValue = Math.max(...data.map(d => d.total), 5);
  const stepValue = Math.max(1, Math.ceil(maxValue / 8)); // Ensure whole number steps
  const adjustedMaxValue = Math.ceil(maxValue / stepValue) * stepValue;

  // Transform data to react-native-gifted-charts format - using simple bars for now
  const transformedData = data.map((dataPoint, index) => ({
    value: dataPoint.total,
    label: dataPoint.period,
    frontColor: '#000000', // Black bars
    labelTextStyle: {
      color: theme.colors.text.muted,
      fontSize: 10,
    },
  }));

  // Calculate bar width to fit exactly across screen
  const availableWidth = chartWidth - 60; // Account for y-axis space
  const spacingValue = 6; // Increased spacing between bars
  const totalSpacing = (data.length - 1) * spacingValue;
  const barWidth = Math.max(10, Math.floor((availableWidth - totalSpacing) / data.length)); // Min width 10

  return (
    <View style={styles.container}>
      <BarChart
        data={transformedData}
        width={chartWidth}
        height={height - 40}
        maxValue={adjustedMaxValue}
        stepValue={stepValue}
        noOfSections={Math.ceil(adjustedMaxValue / stepValue)}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{
          color: theme.colors.text.muted,
          fontSize: 12,
        }}
        xAxisLabelTextStyle={{
          color: theme.colors.text.muted,
          fontSize: 10,
        }}
        isAnimated={false}
        barWidth={barWidth}
        spacing={spacingValue}
        hideRules={true}
        hideYAxisText={false}
      />
    </View>
  );
};

const createStyles = (theme: any, height: number) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.container,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  chart: {
    borderRadius: theme.layout.borderRadius.medium,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.muted),
    fontStyle: 'italic',
  },
});

export default StackedBarChart;