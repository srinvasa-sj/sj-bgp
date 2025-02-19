import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export interface SessionConfig {
  maxIdleTime: number;
  warningTime: number;
  checkInterval: number;
}

export const defaultSessionConfig: SessionConfig = {
  maxIdleTime: 30 * 60 * 1000, // 30 minutes
  warningTime: 5 * 60 * 1000,  // 5 minutes warning
  checkInterval: 60 * 1000,    // Check every minute
};

class SessionManager {
  private lastActivity: number;
  private warningShown: boolean;
  private intervalId: number | null;
  private config: SessionConfig;

  constructor(config: SessionConfig = defaultSessionConfig) {
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.intervalId = null;
    this.config = config;
    this.setupActivityListeners();
  }

  private setupActivityListeners(): void {
    const activities = ['mousedown', 'keydown', 'scroll', 'mousemove', 'click', 'touchstart'];
    activities.forEach(activity => {
      window.addEventListener(activity, () => this.updateActivity());
    });
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    this.warningShown = false;
  }

  public startTracking(): void {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;

      if (timeSinceLastActivity >= this.config.maxIdleTime) {
        this.logout();
      } else if (timeSinceLastActivity >= this.config.warningTime && !this.warningShown) {
        this.showWarning();
        this.warningShown = true;
      }
    }, this.config.checkInterval);
  }

  public stopTracking(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async logout(): Promise<void> {
    try {
      await auth.signOut();
      this.stopTracking();
      toast.success("You have been logged out due to inactivity");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  }

  private showWarning(): void {
    const timeLeft = Math.round((this.config.maxIdleTime - (Date.now() - this.lastActivity)) / 60000);
    toast.warning(`Your session will expire in ${timeLeft} minutes due to inactivity`);
  }
}

export const sessionManager = new SessionManager(); 