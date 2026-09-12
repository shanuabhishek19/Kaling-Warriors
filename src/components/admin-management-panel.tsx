import { useEffect, useState } from "react";
import { KeyRound, ShieldPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Account = {
  user_id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
};

export function AdminManagementPanel({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  async function load() {
    const result = await supabase
      .from("admin_accounts")
      .select("user_id,name,email,status,created_at")
      .order("created_at");
    if (result.error) toast.error(result.error.message);
    else setAccounts((result.data ?? []) as Account[]);
  }
  useEffect(() => {
    void load();
  }, []);
  async function action(body: Record<string, string>) {
    setLoading(true);
    const result = await supabase.functions.invoke("manage-admin", { body });
    setLoading(false);
    if (result.error) toast.error(result.error.message);
    else if (result.data?.error) toast.error(result.data.error);
    else {
      toast.success("Administrator updated");
      await load();
    }
  }
  async function changeOwnPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwords.next.length < 12 || passwords.next !== passwords.confirm) {
      toast.error("New passwords must match and be at least 12 characters.");
      return;
    }
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    const verified = user?.email
      ? await supabase.auth.signInWithPassword({
          email: user.email,
          password: passwords.current,
        })
      : null;
    if (verified?.error) {
      setLoading(false);
      toast.error("Current password is incorrect.");
      return;
    }
    const result = await supabase.auth.updateUser({ password: passwords.next });
    setLoading(false);
    if (result.error) toast.error(result.error.message);
    else {
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password changed");
    }
  }
  return (
    <div>
      <div className="mb-7 border-b border-border pb-7">
        <p className="font-heading text-xs uppercase tracking-[0.28em] text-primary">
          Access control
        </p>
        <h1 className="display-title mt-2 text-4xl">Administrators</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Manage active club operators without exposing passwords.
        </p>
      </div>
      <form
        className="mb-6 grid gap-4 rounded-xl border border-border bg-card/40 p-5 sm:grid-cols-3"
        onSubmit={changeOwnPassword}
      >
        <div className="sm:col-span-3">
          <p className="font-heading text-xs uppercase tracking-widest text-primary">
            Change your password
          </p>
        </div>
        <Input
          aria-label="Current password"
          type="password"
          placeholder="Current password"
          value={passwords.current}
          onChange={(event) =>
            setPasswords({ ...passwords, current: event.target.value })
          }
          required
        />
        <Input
          aria-label="New password"
          type="password"
          placeholder="New password"
          minLength={12}
          value={passwords.next}
          onChange={(event) =>
            setPasswords({ ...passwords, next: event.target.value })
          }
          required
        />
        <Input
          aria-label="Confirm new password"
          type="password"
          placeholder="Confirm new password"
          minLength={12}
          value={passwords.confirm}
          onChange={(event) =>
            setPasswords({ ...passwords, confirm: event.target.value })
          }
          required
        />
        <div className="sm:col-span-3">
          <Button variant="outline" disabled={loading}>
            <KeyRound className="size-4" /> Change password
          </Button>
        </div>
      </form>
      <form
        className="mb-6 grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void action({ action: "create", ...form });
        }}
      >
        <div className="sm:col-span-2">
          <p className="font-heading text-xs uppercase tracking-widest text-primary">
            Add administrator
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-name">Name</Label>
          <Input
            id="admin-name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Temporary password</Label>
          <Input
            id="admin-password"
            type="password"
            minLength={12}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(status) => setForm({ ...form, status })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Button disabled={loading}>
            <ShieldPlus className="size-4" /> Create administrator
          </Button>
        </div>
      </form>
      <div className="divide-y divide-border rounded-xl border border-border">
        {accounts.map((account) => (
          <div
            key={account.user_id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{account.name || account.email}</p>
              <p className="text-sm text-muted-foreground">
                {account.email} · {account.status} ·{" "}
                {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={loading || account.user_id === currentUserId}
                onClick={() =>
                  void action({
                    action: "status",
                    user_id: account.user_id,
                    status: account.status === "active" ? "disabled" : "active",
                  })
                }
              >
                {account.status === "active" ? "Disable" : "Enable"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={loading || account.user_id === currentUserId}
                onClick={() => {
                  const password = window.prompt(
                    "Enter a new password of at least 12 characters",
                  );
                  if (password)
                    void action({
                      action: "reset",
                      user_id: account.user_id,
                      password,
                    });
                }}
              >
                <KeyRound className="size-4" /> Reset password
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                disabled={loading || account.user_id === currentUserId}
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to remove this administrator? This action cannot be undone.",
                    )
                  )
                    void action({ action: "delete", user_id: account.user_id });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {accounts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No administrator accounts found.
          </p>
        ) : null}
      </div>
    </div>
  );
}
