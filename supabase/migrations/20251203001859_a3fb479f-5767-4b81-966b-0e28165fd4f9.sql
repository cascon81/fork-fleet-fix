-- Add foreign key constraints for data integrity
ALTER TABLE rentals 
ADD CONSTRAINT fk_rentals_forklift 
FOREIGN KEY (forklift_id) 
REFERENCES forklifts(id) 
ON DELETE CASCADE;

ALTER TABLE maintenances 
ADD CONSTRAINT fk_maintenances_forklift 
FOREIGN KEY (forklift_id) 
REFERENCES forklifts(id) 
ON DELETE CASCADE;