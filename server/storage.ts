import { type User, type InsertUser, type Scan, type InsertScan, type Recommendation, type InsertRecommendation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createScan(scan: InsertScan): Promise<Scan>;
  getScansByUserId(userId: string): Promise<Scan[]>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsByScanId(scanId: string): Promise<Recommendation[]>;
  getRecentRecommendations(limit?: number): Promise<Recommendation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private scans: Map<string, Scan>;
  private recommendations: Map<string, Recommendation>;

  constructor() {
    this.users = new Map();
    this.scans = new Map();
    this.recommendations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = { 
      ...insertScan, 
      id, 
      createdAt: new Date() 
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScansByUserId(userId: string): Promise<Scan[]> {
    return Array.from(this.scans.values())
      .filter(scan => scan.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;
    
    const updatedScan = { ...scan, ...updates };
    this.scans.set(id, updatedScan);
    return updatedScan;
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = {
      ...insertRecommendation,
      id,
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByScanId(scanId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.scanId === scanId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentRecommendations(limit: number = 10): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
