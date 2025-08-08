```typescript
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Contact } from '../../models';
import { CrmDataService } from '../../services/crm-data.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  contacts$: Observable<Contact[]>;
  displayedColumns: string[] = ['name', 'company', 'designation', 'contactNumber', 'actions'];
  searchTerm: string = '';
  
  constructor(
    private crmService: CrmDataService,
    private dialog: MatDialog
  ) {
    this.contacts$ = this.crmService.getContacts();
  }

  ngOnInit() {}

  openContactDialog(contact?: Contact) {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '600px',
      data: contact || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.crmService.updateContact(result);
        } else {
          this.crmService.addContact(result);
        }
      }
    });
  }

  deleteContact(contact: Contact) {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.crmService.deleteContact(contact.id);
    }
  }

  viewInteractions(contact: Contact) {
    // Navigate to interactions filtered by customer
  }
}
```
