import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode'; // Library for QR
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { TableService } from '../../core/services/table.service';
import { environment } from '../../../environments/environment';

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
  baseUrl = `${environment.tablesQrURL}/public-menu`; // Use your Laptop IP
  restaurantId: number | null = null;
  restaurantName: string = "Our Restaurant"; // You can fetch this from AuthService if available

  constructor(
    private tableService: TableService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

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
    if (confirm('Delete this table?')) {
      await this.tableService.deleteTable(id);
      this.toastr.info('Table deleted');
      await this.loadTables();
    }
  }

  printQR(table: any) {
    const qrElement = document.getElementById(`qr-${table.id}`)?.getElementsByTagName('img')[0];
    if (!qrElement) {
      this.toastr.error('QR Code not ready yet');
      return;
    }

    const qrSrc = qrElement.src;
    const tName = table.table_number;
    const rName = this.restaurantName; // Or this.restaurantName

    // 2. Create a hidden Print Window
    const printWindow = window.open('', '_blank', 'width=600,height=800');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR - ${tName}</title>
            <style>
              body { 
                font-family: 'Inter', sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                background: #f9f9f9;
              }
              .qr-card {
                background: white;
                padding: 40px;
                border-radius: 40px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                text-align: center;
                border: 2px solid #eee;
                width: 350px;
              }
              .restaurant-name {
                font-size: 24px;
                font-weight: 900;
                color: #111;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: -1px;
              }
              .tagline {
                font-size: 12px;
                color: #f97316;
                font-weight: 800;
                margin-bottom: 30px;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .qr-image {
                width: 250px;
                height: 250px;
                margin-bottom: 30px;
              }
              .table-label {
                font-size: 10px;
                font-weight: 900;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 3px;
                margin-bottom: 5px;
              }
              .table-number {
                font-size: 42px;
                font-weight: 900;
                color: #111;
                margin: 0;
              }
              @media print {
                body { background: white; }
                .qr-card { box-shadow: none; border: 1px solid #eee; }
              }
            </style>
          </head>
          <body>
            <div class="qr-card">
              <div class="restaurant-name">${rName}</div>
              <div class="tagline">Scan to Order</div>
              <img src="${qrSrc}" class="qr-image" />
              <div class="table-label">Table Number</div>
              <div class="table-number">${tName}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}