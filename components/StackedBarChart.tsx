import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
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
  const styles = createStyles(theme);
  

  
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
  const chartPadding = theme.spacing.container;
  const chartWidth = Math.max(screenWidth - (chartPadding * 2), data.length * 60);
  const barWidth = Math.max(40, (chartWidth - (chartPadding * 2)) / Math.max(data.length, 1) - 8);
  
  // Find the maximum total to scale the bars
  const maxTotal = Math.max(...data.map(d => d.total), 1);
  
  // Chart dimensions
  const chartHeight = height - 80; // Leave space for labels
  const yAxisWidth = 40;
  const xAxisHeight = 60;
  
  // Generate Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = [];
  for (let i = 0; i <= yAxisSteps; i++) {
    yAxisLabels.push(Math.round((maxTotal * i) / yAxisSteps));
  }

  const renderBar = (dataPoint: ChartDataPoint, index: number) => {
    const x = yAxisWidth + (index * (barWidth + 8));
    let stackY = chartHeight;
    const bars: JSX.Element[] = [];
    
    dataPoint.categoryData.forEach((category, catIndex) => {
      if (category.count === 0) return;
      
      const barHeight = (category.count / maxTotal) * chartHeight;
      const currentY = stackY - barHeight;
      
      bars.push(
        <Rect
          key={`${index}-${catIndex}`}
          x={x}
          y={currentY}
          width={barWidth}
          height={barHeight}
          fill={category.categoryColor}
          rx={2}
          ry={2}
        />
      );
      
      stackY = currentY;
    });
    
    return bars;
  };

  const renderYAxis = () => {
    return yAxisLabels.map((label, index) => {
      const y = chartHeight - (index * (chartHeight / yAxisSteps));
      return (
        <SvgText
          key={`y-${index}`}
          x={yAxisWidth - 5}
          y={y + 4}
          fontSize="12"
          fill={theme.colors.text.muted}
          textAnchor="end"
        >
          {label}
        </SvgText>
      );
    });
  };

  const renderGridLines = () => {
    return yAxisLabels.map((_, index) => {
      const y = chartHeight - (index * (chartHeight / yAxisSteps));
      return (
        <Rect
          key={`grid-${index}`}
          x={yAxisWidth}
          y={y}
          width={chartWidth - yAxisWidth}
          height={0.5}
          fill={theme.colors.border}
          opacity={0.3}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {/* Chart SVG */}
          <Svg height={chartHeight + 20} width={Math.max(chartWidth, screenWidth - chartPadding * 2)}>
            {/* Grid lines */}
            {renderGridLines()}
            
            {/* Y-axis labels */}
            {renderYAxis()}
            
            {/* Bars */}
            {data.map((dataPoint, index) => renderBar(dataPoint, index)).flat()}
          </Svg>
          
          {/* X-axis labels */}
          <View style={styles.xAxisContainer}>
            <View style={{ width: yAxisWidth }} />
            {data.map((dataPoint, index) => (
              <View 
                key={`x-label-${index}`}
                style={[styles.xAxisLabel, { width: barWidth + 8 }]}
              >
                <Text style={styles.xAxisText} numberOfLines={2}>
                  {dataPoint.period}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Legend */}
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

const createStyles = (theme: any) => StyleSheet.create({
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
  chartContainer: {
    minWidth: '100%',
  },
  xAxisContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  xAxisLabel: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  xAxisText: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
    textAlign: 'center',
    fontSize: 10,
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