"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Globe, Building2 } from "lucide-react";

export function GaneshlabInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>Ganeshlab Solution - Your company information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Ganeshlab Solution</h3>
            <p className="text-sm text-muted-foreground">CV Software House</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-muted-foreground">
                Cigugur, Kuningan
                <br />
                Jawa Barat, Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">Contact Ganeshlab for phone number</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">contact@ganeshlab.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Website</p>
              <p className="text-sm text-muted-foreground">www.ganeshlab.com</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> As a PIC (Person In Charge) from Ganeshlab Solution, you represent
            the company in managing client projects. Your company information is managed by the
            administration team.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

