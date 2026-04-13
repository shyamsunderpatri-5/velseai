"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";

export function ExperienceSection() {
  const { content, addExperience, updateExperience, removeExperience } =
    useResumeStore();
  const { experience } = content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-1">Work Experience</h2>
          <p className="text-sm text-muted-foreground">
            Add your relevant work experience
          </p>
        </div>
        <Button size="sm" onClick={addExperience}>
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </Button>
      </div>

      {experience.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No work experience added yet
            </p>
            <Button onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Experience
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <Card key={exp.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GripVertical className="w-4 h-4 cursor-move" />
                    Position {index + 1}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={exp.role}
                      onChange={(e) =>
                        updateExperience(exp.id, { role: e.target.value })
                      }
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, { company: e.target.value })
                      }
                      placeholder="Tech Corp India"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={exp.location || ""}
                      onChange={(e) =>
                        updateExperience(exp.id, { location: e.target.value })
                      }
                      placeholder="Bangalore, India"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={(e) =>
                          updateExperience(exp.id, {
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? null : exp.endDate,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor={`current-${exp.id}`} className="text-sm font-normal">
                        Currently working here
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={exp.endDate || ""}
                      onChange={(e) =>
                        updateExperience(exp.id, { endDate: e.target.value || null })
                      }
                      disabled={exp.isCurrent}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Achievements & Responsibilities</Label>
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Generate Bullets
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <span className="text-muted-foreground mt-2">•</span>
                        <Textarea
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...exp.bulletPoints];
                            newBullets[bulletIndex] = e.target.value;
                            updateExperience(exp.id, { bulletPoints: newBullets });
                          }}
                          placeholder="Describe an achievement or responsibility with quantifiable results..."
                          className="min-h-[60px]"
                        />
                        {exp.bulletPoints.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 mt-1"
                            onClick={() => {
                              const newBullets = exp.bulletPoints.filter(
                                (_, i) => i !== bulletIndex
                              );
                              updateExperience(exp.id, { bulletPoints: newBullets });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-5"
                      onClick={() => {
                        const newBullets = [...exp.bulletPoints, ""];
                        updateExperience(exp.id, { bulletPoints: newBullets });
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Bullet Point
                    </Button>
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
