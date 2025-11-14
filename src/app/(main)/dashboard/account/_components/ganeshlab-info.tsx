"use client";

import { MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GaneshlabInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Ganeshlab Solution - Your company information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-lg p-3">
            <Building2 className="text-primary h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Ganeshlab Solution</h3>
            <p className="text-muted-foreground text-sm">CV Software House</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground text-sm">
                Cigugur, Kuningan
                <br />
                Jawa Barat, Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-muted-foreground text-sm">Contact Ganeshlab for phone number</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground text-sm">contact@ganeshlab.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="text-muted-foreground mt-0.5 h-5 w-5" />
            <div>
              <p className="font-medium">Website</p>
              <p className="text-muted-foreground text-sm">www.ganeshlab.com</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> As a PIC (Person In Charge) from Ganeshlab Solution, you
            represent the company in managing client projects. Your company information is managed
            by the administration team.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
