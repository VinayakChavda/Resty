import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode'; // Library for QR
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { TableService } from '../../core/services/table.service';

interface Table {
  id: number;
  table_number: string;
  qr_link: string;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent implements OnInit {
  tables: any[] = [];
  newTableNumber = '';
  baseUrl = 'http://192.168.1.5:4200/public-menu'; // Use your Laptop IP
  restaurantId: number | null = null;

  constructor(
    private tableService: TableService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.restaurantId = this.authService.getRestaurantId();
    await this.loadTables();
  }

  async loadTables() {
    this.tables = await this.tableService.getTables();
    // Har table ke liye QR link generate kar do
    this.tables.forEach(t => {
      t.qr_link = `${this.baseUrl}/${this.restaurantId}/${t.table_number}`;
    });
  }

  async onAddTable() {
    if (!this.newTableNumber) return;
    try {
      await this.tableService.addTable(this.newTableNumber);
      this.toastr.success('Table added to DB!');
      this.newTableNumber = '';
      await this.loadTables();
    } catch (e) { this.toastr.error('Error adding table'); }
  }

  async deleteTable(id: number) {
    if(confirm('Delete this table?')) {
      await this.tableService.deleteTable(id);
      this.toastr.info('Table deleted');
      await this.loadTables();
    }
  }

  printQR(tableNum: string) { window.print(); }
}