```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact, Interaction, InteractionMedium } from '../../models';
import { CrmDataService } from '../../services/crm-data.service';

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.scss']
})
export class InteractionsComponent implements OnInit {
  interactions$: Observable<Interaction[]>;
  contacts$: Observable<Contact[]>;
  interactionForm: FormGroup;
  
  interactionMediums = Object.values(InteractionMedium);
  selectedCustomerId: number | null = null;
  groupByCustomer: boolean = false;
  
  displayedColumns: string[] = ['date', 'customer', 'medium', 'remarks', 'followUp', 'actions'];

  constructor(
    private fb: FormBuilder,
    private crmService: CrmDataService
  ) {
    this.interactions$ = this.crmService.getInteractions();
    this.contacts$ = this.crmService.getContacts();
    
    this.interactionForm = this.fb.group({
      customerId: ['', Validators.required],
      medium: ['', Validators.required],
      date: [new Date(), Validators.required],
      remarks: ['', Validators.required],
      followUpRequired: [false],
      followUpDate: [''],
      duration: ['']
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.interactionForm.valid) {
      const formValue = this.interactionForm.value;
      
      // Get customer name
      this.contacts$.subscribe(contacts => {
        const customer = contacts.find(c => c.id == formValue.customerId);
        if (customer) {
          const interaction: Interaction = {
            ...formValue,
            customerName: customer.name,
            date: new Date(formValue.date)
          };
          
          this.crmService.addInteraction(interaction);
          this.interactionForm.reset();
        }
      });
    }
  }

  getGroupedInteractions(): Observable<any[]> {
    return combineLatest([this.interactions$, this.contacts$]).pipe(
      map(([interactions, contacts]) => {
        const grouped = interactions.reduce((acc, interaction) => {
          if (!acc[interaction.customerId]) {
            const customer = contacts.find(c => c.id === interaction.customerId);
            acc[interaction.customerId] = {
              customer: customer,
              interactions: []
            };
          }
          acc[interaction.customerId].interactions.push(interaction);
          return acc;
        }, {} as any);
        
        return Object.values(grouped);
      })
    );
  }

  filterInteractions(medium?: InteractionMedium, followUpRequired?: boolean): Observable<Interaction[]> {
    return this.interactions$.pipe(
      map(interactions => interactions.filter(interaction => {
        if (medium && interaction.medium !== medium) return false;
        if (followUpRequired !== undefined && interaction.followUpRequired !== followUpRequired) return false;
        if (this.selectedCustomerId && interaction.customerId !== this.selectedCustomerId) return false;
        return true;
      }))
    );
  }
}
```