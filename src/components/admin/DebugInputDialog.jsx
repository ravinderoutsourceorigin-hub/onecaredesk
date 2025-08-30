import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function DebugInputDialog({ open, onOpenChange, config, onSubmit, isLoading }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open && config) {
      // Reset form when dialog opens with a new config
      const initialValues = config.inputs.reduce((acc, input) => {
        acc[input.name] = '';
        return acc;
      }, {});
      setValues(initialValues);
    }
  }, [open, config]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };
  
  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {config.inputs.map((input) => (
              <div key={input.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={input.name} className="text-right">
                  {input.label}
                </Label>
                <Input
                  id={input.name}
                  name={input.name}
                  type={input.type || 'text'}
                  value={values[input.name] || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {config.submitText || 'Run'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}