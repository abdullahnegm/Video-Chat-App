class HomeController < ApplicationController
   def index
      @users = User.where.not(id: current_user.id)
   end
end