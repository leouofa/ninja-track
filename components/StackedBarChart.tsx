import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StackedBarChart as ChartKitStackedBarChart } from 'react-native-chart-kit';
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

  // Transform our data format to react-native-chart-kit format
  const transformedData = {
    labels: data.map(d => d.period),
    data: data.map(dataPoint => 
      dataPoint.categoryData.map(category => category.count)
    ),
    barColors: data.length > 0 ? data[0].categoryData.map(c => c.categoryColor) : []
  };



  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => 'transparent', // Make all text transparent
    labelColor: (opacity = 1) => theme.colors.text.muted,
    style: {
      borderRadius: theme.layout.borderRadius.large,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: theme.colors.border,
      strokeOpacity: 0.3,
    },
    propsForLabels: {
      fontSize: 0,
      fontFamily: 'System',
      fill: 'transparent',
      stroke: 'transparent',
      fillOpacity: 0,
      strokeOpacity: 0,
    },
    barPercentage: 0.7,
    fillShadowGradient: theme.colors.accent,
    fillShadowGradientOpacity: 1,
  };

  const chartComponentWidth = Math.max(chartWidth, data.length * 80);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartComponentWidth }}>
          {/* Total Values Above Bars */}
          <View style={styles.totalsContainer}>
            {data.map((dataPoint, index) => {
              const total = dataPoint.categoryData.reduce((sum, category) => sum + category.count, 0);
              const barWidth = chartComponentWidth / data.length;
              const leftPosition = (barWidth * index) + (barWidth / 2) - 10; // Center above bar
              
              return (
                <Text 
                  key={`total-${index}`} 
                  style={[styles.totalText, { left: leftPosition }]}
                >
                  {total}
                </Text>
              );
            })}
          </View>
          
          <ChartKitStackedBarChart
            style={styles.chart}
            data={transformedData}
            width={chartComponentWidth}
            height={height - 40}
            chartConfig={chartConfig}
            withVerticalLabels={true}
            withHorizontalLabels={false}
            showLegend={false}
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
  totalsContainer: {
    position: 'relative',
    height: 30,
    marginBottom: -10,
  },
  totalText: {
    position: 'absolute',
    top: 5,
    ...createTextStyle(theme, 'bodySmall'),
    fontWeight: '600',
    fontSize: 12,
    color: theme.colors.text.primary,
    textAlign: 'center',
    width: 20,
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