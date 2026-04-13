"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export function CertificationsSection() {
  const { content, addCertification, updateCertification, removeCertification } =
    useResumeStore();
  const { certifications } = content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-1">Certifications</h2>
          <p className="text-sm text-muted-foreground">
            Add professional certifications and licenses
          </p>
        </div>
        <Button size="sm" onClick={addCertification}>
          <Plus className="w-4 h-4 mr-1" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No certifications added yet
            </p>
            <Button onClick={addCertification}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <Card key={cert.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">
                    Certification {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeCertification(cert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certification Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(cert.id, { name: e.target.value })
                      }
                      placeholder="AWS Solutions Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing Organization</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        updateCertification(cert.id, { issuer: e.target.value })
                      }
                      placeholder="Amazon Web Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) =>
                        updateCertification(cert.id, { issueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input
                      type="month"
                      value={cert.expiryDate || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, {
                          expiryDate: e.target.value || undefined,
                        })
                      }
                      placeholder="Leave blank if no expiry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credential ID</Label>
                    <Input
                      value={cert.credentialId || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, {
                          credentialId: e.target.value,
                        })
                      }
                      placeholder="ABC123XYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credential URL</Label>
                    <Input
                      type="url"
                      value={cert.credentialUrl || ""}
                      onChange={(e) =>
                        updateCertification(cert.id, {
                          credentialUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
