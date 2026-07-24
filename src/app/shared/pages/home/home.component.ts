import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ToolbarModule } from 'primeng/toolbar';
import { DashboardSummary } from '../../interfaces/dashboard-summary';
import { DashboardService } from '../../services/dashboard/dashboard.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    ChartModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  summary?: DashboardSummary;
  lineData: any;
  pieData: any;
  chartOptions: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getSummary().subscribe((res) => {
      if (res.success && res.data) {
        this.summary = res.data;
        this.initCharts();
      }
    });

    this.chartOptions = {
      plugins: { legend: { labels: { color: '#ebedef' } } },
      scales: {
        x: {
          ticks: { color: '#ebedef' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#ebedef' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    };
  }

  initCharts() {
    this.lineData = {
      labels: this.summary?.monthlyEvolution.map((m) => m.month),
      datasets: [
        {
          label: 'Pedidos Realizados',
          data: this.summary?.monthlyEvolution.map((m) => m.count),
          fill: true,
          borderColor: '#42A5F5',
          tension: 0.4,
          backgroundColor: 'rgba(66,165,245,0.2)',
        },
      ],
    };

    this.pieData = {
      labels: this.summary?.categoryDistribution.map((c) => c.category),
      datasets: [
        {
          data: this.summary?.categoryDistribution.map((c) => c.value),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
        },
      ],
    };
  }
}
