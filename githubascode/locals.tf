# ---------------------------------------------------------------------------------------------------------------------
# LOCAL VALUES - CENTRALIZED CSV CONFIGURATION PARSING
# ---------------------------------------------------------------------------------------------------------------------

locals {
  # Base directory for all centralized CSV configurations
  config_path = "${path.module}/config"

  # 1. Parse Organization Members (config/members.csv)
  members_raw = csvdecode(file("${local.config_path}/members.csv"))
  members_data = {
    for m in local.members_raw : m.username => {
      role = try(m.role, "member")
    } if trimspace(try(m.username, "")) != ""
  }

  # 2. Parse Teams (config/teams.csv) and Team Members (config/team-members/*.csv)
  # Each file in config/team-members is named by team name, and exact team name is read from the 'team' CSV column.
  teams_raw = csvdecode(file("${local.config_path}/teams.csv"))

  team_members_raw = flatten([
    for file in fileset("${local.config_path}/team-members", "*.csv") :
    csvdecode(file("${local.config_path}/team-members/${file}"))
  ])

  team_members_by_team = {
    for t in local.teams_raw : t.name => {
      for row in local.team_members_raw : row.username => {
        role = coalesce(try(row.role, "member"), "member")
      } if trimspace(coalesce(try(row.team, ""), try(row.team_name, ""))) == t.name
        && trimspace(try(row.username, "")) != ""
    }
  }

  teams_data = {
    for t in local.teams_raw : t.name => {
      description               = try(t.description, "")
      privacy                   = try(t.privacy, "closed")
      create_default_maintainer = true
      members                   = lookup(local.team_members_by_team, t.name, {})
    } if trimspace(try(t.name, "")) != ""
  }

  # 3. Parse Repositories (config/repositories.csv) & Team Permissions (config/repos-team/*.csv)
  # Each file in config/repos-team is named by repository name, and exact repo name is read from the 'repository' CSV column.
  repositories_raw = csvdecode(file("${local.config_path}/repositories.csv"))

  repo_teams_raw = flatten([
    for file in fileset("${local.config_path}/repos-team", "*.csv") :
    csvdecode(file("${local.config_path}/repos-team/${file}"))
  ])

  repo_teams_by_repo = {
    for r in local.repositories_raw : r.name => {
      for row in local.repo_teams_raw : row.team_name => {
        permission = row.permission
      } if trimspace(coalesce(try(row.repository, ""), try(row.repository_name, ""))) == r.name
        && trimspace(try(row.team_name, "")) != ""
    }
  }

  repositories_data = {
    for r in local.repositories_raw : r.name => {
      description      = try(r.description, "")
      visibility       = try(r.visibility, "public")
      auto_init        = try(r.auto_init, "true") == "true"
      has_issues       = try(r.has_issues, "true") == "true"
      has_wiki         = try(r.has_wiki, "false") == "true"
      has_projects     = try(r.has_projects, "false") == "true"
      team_permissions = lookup(local.repo_teams_by_repo, r.name, {})
    } if trimspace(try(r.name, "")) != ""
  }

  # 4. Parse Environments per Repository (config/environments.csv)
  environments_raw = csvdecode(file("${local.config_path}/environments.csv"))
  environments_data = {
    for row in local.environments_raw : "${row.repository}:${row.environment}" => {
      repository          = row.repository
      environment         = row.environment
      can_admins_bypass   = try(row.can_admins_bypass, "false") == "true"
      prevent_self_review = try(row.prevent_self_review, "true") == "true"
      wait_timer          = try(tonumber(row.wait_timer), 0)
    } if trimspace(try(row.repository, "")) != "" && trimspace(try(row.environment, "")) != ""
  }

  # 5. Parse Branch Protection Rules per Repository (config/branch_protection.csv)
  branch_protection_raw = csvdecode(file("${local.config_path}/branch_protection.csv"))
  branch_protection_data = {
    for bp in local.branch_protection_raw : "${bp.repository}:${try(bp.branch, "main")}" => {
      repository                      = bp.repository
      branch                          = try(bp.branch, "main")
      enforce_admins                  = try(bp.enforce_admins, "true") == "true"
      required_linear_history         = try(bp.required_linear_history, "true") == "true"
      allows_force_pushes             = try(bp.allows_force_pushes, "false") == "true"
      allows_deletions                = try(bp.allows_deletions, "false") == "true"
      require_conversation_resolution = try(bp.require_conversation_resolution, "true") == "true"
      require_signed_commits          = try(bp.require_signed_commits, "false") == "true"
      dismiss_stale_reviews           = try(bp.dismiss_stale_reviews, "true") == "true"
      require_code_owner_reviews      = try(bp.require_code_owner_reviews, "true") == "true"
      required_approvals              = try(tonumber(bp.required_approvals), 1)
      require_last_push_approval      = try(bp.require_last_push_approval, "true") == "true"
    } if trimspace(try(bp.repository, "")) != ""
  }
}
