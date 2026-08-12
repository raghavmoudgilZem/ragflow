import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDatasetModal } from './create-dataset-modal.component';

describe('CreateDatasetModalComponent', () => {
  let component: CreateDatasetModal;
  let fixture: ComponentFixture<CreateDatasetModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDatasetModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateDatasetModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
