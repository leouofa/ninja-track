import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  // Transform data to react-native-gifted-charts format for stacked bars
  const transformedData = data.map((dataPoint, index) => {
    // Create stacked segments for each bar
    const stackData = dataPoint.categoryData.map((category, catIndex) => ({
      value: category.count,
      frontColor: category.categoryColor,
    }));

    return {
      value: dataPoint.total,
      stackData: stackData,
      label: dataPoint.period,
      spacing: index === 0 ? 20 : 6, // More spacing for first bar
      labelTextStyle: {
        color: theme.colors.text.muted,
        fontSize: 10,
      },
    };
  });

  const chartComponentWidth = Math.max(chartWidth, data.length * 80);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartComponentWidth }}>
          <BarChart
            data={transformedData}
            width={chartComponentWidth}
            height={height - 40}
            maxValue={adjustedMaxValue}
            stepValue={stepValue}
            noOfSections={Math.ceil(adjustedMaxValue / stepValue)}
            yAxisThickness={1}
            yAxisColor={theme.colors.border}
            xAxisThickness={1}
            xAxisColor={theme.colors.border}
            yAxisTextStyle={{
              color: theme.colors.text.muted,
              fontSize: 12,
            }}
            xAxisLabelTextStyle={{
              color: theme.colors.text.muted,
              fontSize: 10,
              textAlign: 'center',
            }}
            isAnimated={false}
            barWidth={40}
            barBorderRadius={4}
            spacing={6}
            hideRules={false}
            rulesColor={theme.colors.border}
            rulesThickness={0.5}
            hideYAxisText={false}
          />
        </View>
      </ScrollView>
      
      {/* Custom Legend at Bottom */}
      {data.length > 0 && data[0].categoryData.length > 0 && (
        <View style={styles.legend}>
          {data[0].categoryData.map((category, index) => (
            <View key={`legend-${index}`} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: category.categoryColor }
                ]} 
              />
              <Text style={styles.legendText}>{category.categoryName}</Text>
            </View>
          ))}
        </View>
      )}
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  legendText: {
    ...createTextStyle(theme, 'bodySmall'),
    fontSize: 12,
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